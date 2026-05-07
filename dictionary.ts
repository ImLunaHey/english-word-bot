import { getCached, setCached } from './cache';

export interface WordData {
  word: string;
  partOfSpeech: string;
  definition: string;
  example: string | null;
  ipa: string | null;
  etymology: string | null;
  originLanguage: string | null;
}

const UA = 'englishwordbot/1.0 (https://bsky.app/profile/englishwordbot.bsky.social)';

const ORIGIN_LANGUAGES = [
  'Proto-Indo-European',
  'Late Latin', 'Vulgar Latin', 'Medieval Latin', 'Latin',
  'Ancient Greek', 'Greek',
  'Old French', 'Middle French', 'Anglo-Norman', 'French',
  'Old English', 'Middle English', 'Anglo-Saxon',
  'Old High German', 'Proto-Germanic', 'German',
  'Italian', 'Spanish', 'Portuguese', 'Dutch',
  'Arabic', 'Hebrew', 'Sanskrit', 'Persian',
  'Japanese', 'Chinese', 'Hindi',
  'Old Norse', 'Norse', 'Scottish Gaelic', 'Irish', 'Celtic', 'Gaelic',
];

export async function fetchWordData(word: string): Promise<WordData | null> {
  const cached = getCached<WordData | null>(word);
  if (cached !== undefined) return cached;

  let result = await tryDictionaryApiDev(word);

  if (!result) {
    result = await tryWiktionary(word);
  }

  if (result && (!result.ipa || !result.etymology)) {
    const enrichment = await fetchWikitextEnrichment(word);
    if (enrichment) {
      result.ipa = result.ipa ?? enrichment.ipa;
      result.etymology = result.etymology ?? enrichment.etymology;
      result.originLanguage = result.originLanguage ?? enrichment.originLanguage;
    }
  }

  setCached(word, result);
  return result;
}

async function tryDictionaryApiDev(word: string): Promise<WordData | null> {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { headers: { 'User-Agent': UA } }
    );
    if (!res.ok) return null;

    const json = await res.json();
    const entry = Array.isArray(json) ? json[0] : null;
    if (!entry) return null;

    const meaning = entry.meanings?.[0];
    const def = meaning?.definitions?.[0];
    if (!def?.definition) return null;

    const phonetic =
      entry.phonetic ??
      entry.phonetics?.find((p: any) => p.text)?.text ??
      null;

    return {
      word,
      partOfSpeech: meaning.partOfSpeech ?? '',
      definition: def.definition,
      example: def.example ?? null,
      ipa: phonetic ? phonetic.replace(/^\/|\/$/g, '') : null,
      etymology: entry.origin ?? null,
      originLanguage: entry.origin ? detectOriginLanguage(entry.origin) : null,
    };
  } catch {
    return null;
  }
}

async function tryWiktionary(word: string): Promise<WordData | null> {
  try {
    const res = await fetch(
      `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`,
      { headers: { 'User-Agent': UA } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const en = data.en?.[0];
    if (!en?.definitions?.[0]) return null;

    return {
      word,
      partOfSpeech: en.partOfSpeech ?? '',
      definition: stripHtml(en.definitions[0].definition),
      example: en.definitions[0].examples?.[0] ? stripHtml(en.definitions[0].examples[0]) : null,
      ipa: null,
      etymology: null,
      originLanguage: null,
    };
  } catch {
    return null;
  }
}

interface Enrichment {
  ipa: string | null;
  etymology: string | null;
  originLanguage: string | null;
}

async function fetchWikitextEnrichment(word: string): Promise<Enrichment | null> {
  try {
    const url = `https://en.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(word)}&prop=wikitext&format=json&formatversion=2`;
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;

    const data = await res.json();
    const wikitext: string | undefined = data.parse?.wikitext;
    if (!wikitext) return null;

    const englishSection = extractEnglishSection(wikitext);
    const source = englishSection ?? wikitext;

    const ipa = extractIPA(source);
    const etymology = extractEtymology(source);
    const originLanguage = etymology ? detectOriginLanguage(etymology) : null;

    return { ipa, etymology, originLanguage };
  } catch {
    return null;
  }
}

function extractEnglishSection(wikitext: string): string | null {
  const start = wikitext.indexOf('==English==');
  if (start === -1) return null;
  const after = wikitext.slice(start + '==English=='.length);
  const next = after.search(/\n==[^=]/);
  return next === -1 ? after : after.slice(0, next);
}

function extractIPA(wikitext: string): string | null {
  const m = wikitext.match(/\{\{IPA\|en\|([^}|]+)/);
  if (!m) return null;
  return m[1].trim().replace(/^\/|\/$/g, '').replace(/^\[|\]$/g, '');
}

function extractEtymology(wikitext: string): string | null {
  const m = wikitext.match(/===\s*Etymology(?:\s+\d+)?\s*===\s*\n([\s\S]*?)(?=\n===|\n==[^=]|$)/);
  if (!m) return null;

  let text = m[1];

  text = text.replace(/\{\{(?:der|inh|bor|cog|m|l)\|[^|}]*\|[^|}]*\|([^|}]+)[^}]*\}\}/g, '$1');
  text = text.replace(/\{\{(?:der|inh|bor)\|en\|([a-z\-]{2,8})\}\}/g, (_, code) => languageCodeToName(code));

  text = text
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/\[\[[^\]|]*\|([^\]]+)\]\]/g, '$1')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/'''([^']+)'''/g, '$1')
    .replace(/''([^']+)''/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const firstPara = text.split(/\n\n/)[0].trim();
  if (!firstPara || firstPara.length < 10) return null;

  return firstPara.length > 240 ? firstPara.slice(0, 237) + '...' : firstPara;
}

function languageCodeToName(code: string): string {
  const map: Record<string, string> = {
    la: 'Latin', grc: 'Ancient Greek', el: 'Greek',
    fr: 'French', fro: 'Old French', frm: 'Middle French',
    enm: 'Middle English', ang: 'Old English',
    de: 'German', goh: 'Old High German', 'gem-pro': 'Proto-Germanic',
    it: 'Italian', es: 'Spanish', pt: 'Portuguese', nl: 'Dutch',
    ar: 'Arabic', he: 'Hebrew', sa: 'Sanskrit', fa: 'Persian',
    ja: 'Japanese', zh: 'Chinese', hi: 'Hindi',
    non: 'Old Norse', gd: 'Scottish Gaelic', ga: 'Irish',
    'ine-pro': 'Proto-Indo-European', LL: 'Late Latin', VL: 'Vulgar Latin', ML: 'Medieval Latin',
  };
  return map[code] ?? code;
}

function detectOriginLanguage(text: string): string | null {
  let best: { lang: string; pos: number } | null = null;
  for (const lang of ORIGIN_LANGUAGES) {
    const pos = text.indexOf(lang);
    if (pos !== -1 && (best === null || pos < best.pos)) {
      best = { lang, pos };
    }
  }
  return best?.lang ?? null;
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}
