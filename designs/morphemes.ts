const PREFIXES = ['sub', 'pre', 'un', 're', 'dis', 'mis', 'over', 'inter', 'trans', 'anti', 'hyper', 'super', 'semi', 'auto', 'co', 'de', 'ex', 'non'];
const SUFFIXES = ['ation', 'tion', 'sion', 'ment', 'ness', 'ity', 'able', 'ible', 'ful', 'less', 'ous', 'ive', 'ize', 'ise', 'ly', 'ing', 'ed', 'er', 'or', 'ist', 'ism'];

export const PREFIX_GLOSS: Record<string, string> = {
  sub: 'under', pre: 'before', un: 'not', re: 'again', dis: 'apart', mis: 'wrong',
  over: 'above', inter: 'between', trans: 'across', anti: 'against', hyper: 'over',
  super: 'above', semi: 'half', auto: 'self', co: 'with', de: 'down', ex: 'out', non: 'not',
};
export const SUFFIX_GLOSS: Record<string, string> = {
  ation: 'act of', tion: 'act of', sion: 'state', ment: 'result', ness: 'quality',
  ity: 'state', able: 'capable of', ible: 'capable of', ful: 'full of', less: 'without',
  ous: 'having', ive: 'tending to', ize: 'make', ise: 'make', ly: 'in manner', ing: 'action',
  ed: 'past', er: 'one who', or: 'one who', ist: 'one who', ism: 'doctrine',
};

export interface MorphemeKind {
  segment: string;
  kind: 'prefix' | 'root' | 'suffix';
  gloss: string | null;
}

export function splitMorphemes(word: string): { segments: string[]; glosses: (string | null)[] } {
  const detailed = splitMorphemesDetailed(word);
  return {
    segments: detailed.map(d => d.segment),
    glosses: detailed.map(d => d.gloss),
  };
}

export function splitMorphemesDetailed(word: string): MorphemeKind[] {
  const lower = word.toLowerCase();
  const result: MorphemeKind[] = [];
  let remaining = lower;

  for (const p of [...PREFIXES].sort((a, b) => b.length - a.length)) {
    if (remaining.startsWith(p) && remaining.length > p.length + 2) {
      result.push({ segment: remaining.slice(0, p.length), kind: 'prefix', gloss: PREFIX_GLOSS[p] ?? null });
      remaining = remaining.slice(p.length);
      break;
    }
  }

  let suffix: MorphemeKind | null = null;
  for (const s of [...SUFFIXES].sort((a, b) => b.length - a.length)) {
    if (remaining.endsWith(s) && remaining.length > s.length + 2) {
      suffix = { segment: s, kind: 'suffix', gloss: SUFFIX_GLOSS[s] ?? null };
      remaining = remaining.slice(0, -s.length);
      break;
    }
  }

  if (remaining) result.push({ segment: remaining, kind: 'root', gloss: null });
  if (suffix) result.push(suffix);

  if (result.length === 1) {
    const mid = Math.ceil(result[0].segment.length / 2);
    return [
      { segment: result[0].segment.slice(0, mid), kind: 'root', gloss: null },
      { segment: result[0].segment.slice(mid), kind: 'root', gloss: null },
    ];
  }

  return result;
}
