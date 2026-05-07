import { existsSync, readFileSync, writeFileSync } from 'fs';

const CACHE_PATH = process.env.WORD_CACHE_PATH;

let cache: Record<string, any> | null = null;

function load(): Record<string, any> | null {
  if (!CACHE_PATH) return null;
  if (cache !== null) return cache;
  if (!existsSync(CACHE_PATH)) {
    cache = {};
    return cache;
  }
  try {
    cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8'));
    return cache!;
  } catch {
    cache = {};
    return cache;
  }
}

function save() {
  if (!CACHE_PATH || cache === null) return;
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf8');
}

export function getCached<T>(key: string): T | undefined {
  const c = load();
  if (!c) return undefined;
  return key in c ? c[key] : undefined;
}

export function setCached(key: string, value: any) {
  const c = load();
  if (!c) return;
  c[key] = value;
  save();
}
