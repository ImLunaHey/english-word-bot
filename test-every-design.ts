import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import wordListPath from 'word-list';
import { fetchWordData } from './dictionary';
import { ALL_DESIGNS, renderDesign } from './designs';
import { DESIGN_WIDTH, DESIGN_HEIGHT, rasterizeSvg } from './image';

const WATERMARK = '@englishwordbot.bsky.social';
const OUT_DIR = process.env.TEST_OUTPUT_DIR ?? './test-output';
const WORDS = readFileSync(wordListPath, 'utf8').split('\n').filter(Boolean);

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const ordered = ALL_DESIGNS.slice();

  for (const design of ordered) {
    let chosen: { word: string; data: any } | null = null;
    const candidates = shuffle(WORDS).slice(0, 100);
    for (const word of candidates) {
      const data = await fetchWordData(word);
      if (!data) continue;
      if (!design.canRender(data)) continue;
      chosen = { word, data };
      break;
    }
    if (!chosen) {
      console.log(`  [skip] could not find renderable word for ${design.name}`);
      continue;
    }
    const svg = renderDesign(design, { data: chosen.data, watermark: WATERMARK, width: DESIGN_WIDTH, height: DESIGN_HEIGHT });
    const buf = await rasterizeSvg(svg);
    const out = join(OUT_DIR, `every-${design.name}-${chosen.word}.png`);
    writeFileSync(out, buf);
    console.log(`  ${design.name} <- ${chosen.word} (${(buf.length / 1024).toFixed(0)} KB)`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
