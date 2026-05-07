export function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function entryNumber(word: string): string {
  return String(hash(word) % 9999).padStart(4, '0');
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function approxSyllables(word: string): number {
  const m = word.toLowerCase().match(/[aeiouy]+/g);
  return m ? m.length : 1;
}

export function truncate(text: string, maxChars: number): string {
  return text.length > maxChars ? text.slice(0, maxChars - 1).trimEnd() + '…' : text;
}

export function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) {
      if (cur) lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur.trim());
  return lines;
}

export function splitWord(word: string): string[] {
  if (word.length <= 6) return [word];
  const mid = Math.ceil(word.length / 2);
  let splitAt = mid;
  for (let off = 0; off < 3; off++) {
    if ('aeiouAEIOU'.includes(word[mid + off] ?? '')) { splitAt = mid + off; break; }
    if ('aeiouAEIOU'.includes(word[mid - off] ?? '')) { splitAt = mid - off; break; }
  }
  return [word.slice(0, splitAt), word.slice(splitAt)];
}

export const LANG_CODES: Record<string, string> = {
  Latin: 'LAT', 'Late Latin': 'LAT', 'Vulgar Latin': 'LAT', 'Medieval Latin': 'LAT',
  Greek: 'GRC', 'Ancient Greek': 'GRC',
  French: 'FRA', 'Old French': 'OFR', 'Middle French': 'MFR', 'Anglo-Norman': 'ANO',
  'Old English': 'OE', 'Middle English': 'ME',
  German: 'GER', 'Old High German': 'OHG', 'Proto-Germanic': 'PGM',
  Italian: 'ITA', Spanish: 'SPA', Portuguese: 'POR',
  Dutch: 'NLD', Arabic: 'ARA', Hebrew: 'HEB',
  Sanskrit: 'SAN', Persian: 'PER', Japanese: 'JPN',
  Chinese: 'ZHO', Hindi: 'HIN', 'Old Norse': 'ONO',
  Norse: 'ONO', 'Scottish Gaelic': 'GLA', Irish: 'GLE', Celtic: 'CEL',
  'Proto-Indo-European': 'PIE',
};

export function langCode(language: string | null): string {
  if (!language) return '???';
  return LANG_CODES[language] ?? language.slice(0, 3).toUpperCase();
}

export function posAbbrev(part: string): string {
  const lower = part.toLowerCase();
  if (lower.startsWith('noun')) return 'n.';
  if (lower.startsWith('verb')) return 'v.';
  if (lower.startsWith('adject')) return 'adj.';
  if (lower.startsWith('adverb')) return 'adv.';
  if (lower.startsWith('pronoun')) return 'pron.';
  if (lower.startsWith('prepos')) return 'prep.';
  if (lower.startsWith('conjunc')) return 'conj.';
  if (lower.startsWith('interj')) return 'interj.';
  return part;
}

export function starGlyphs(filled: number, total = 5): string {
  return '*'.repeat(filled) + '·'.repeat(Math.max(0, total - filled));
}

export function rarityStars(word: string): number {
  let h = 0;
  for (let i = 0; i < word.length; i++) h = (h * 31 + word.charCodeAt(i)) >>> 0;
  const lengthScore = Math.min(3, Math.floor(word.length / 5));
  const hashScore = h % 3;
  return Math.max(1, Math.min(5, lengthScore + hashScore));
}

export function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

export function extractCentury(etymology: string | null): string | null {
  if (!etymology) return null;
  const m = etymology.match(/\b(\d{4})\b/) ?? etymology.match(/\b(\d{1,2})(?:st|nd|rd|th)\s+century\b/i);
  if (!m) return null;
  if (m[0].toLowerCase().includes('century')) return `${m[1]}C`;
  const year = parseInt(m[1], 10);
  if (year < 1000 || year > 2100) return null;
  const c = Math.ceil(year / 100);
  return `${c}C`;
}
