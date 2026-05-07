import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import wordListPath from 'word-list';
import { fetchWordData } from './dictionary';
import { ALL_DESIGNS, pickDesign, renderDesign } from './designs';
import { DESIGN_WIDTH, DESIGN_HEIGHT, rasterizeSvg } from './image';

const WATERMARK = '@englishwordbot.bsky.social';
const OUT_DIR = process.env.TEST_OUTPUT_DIR ?? './test-output';

async function main() {
  const allWords = readFileSync(wordListPath, 'utf8').split('\n').filter(Boolean);
  const N = parseInt(process.argv[2] ?? '10', 10);
  mkdirSync(OUT_DIR, { recursive: true });

  let attempted = 0;
  let succeeded = 0;
  const usedDesigns = new Set<string>();
  const seenWords = new Set<string>();

  while (succeeded < N && attempted < N * 8) {
    attempted++;
    const word = allWords[Math.floor(Math.random() * allWords.length)];
    if (seenWords.has(word)) continue;
    seenWords.add(word);

    const data = await fetchWordData(word);
    if (!data) {
      console.log(`  [skip] no data for "${word}"`);
      continue;
    }
    const design = pickDesign(data);
    const ctx = { data, watermark: WATERMARK, width: DESIGN_WIDTH, height: DESIGN_HEIGHT };
    try {
      const svg = renderDesign(design, ctx);
      const buf = await rasterizeSvg(svg);
      const out = join(OUT_DIR, `deck-${String(succeeded + 1).padStart(2, '0')}-${word}-${design.name}.png`);
      writeFileSync(out, buf);
      usedDesigns.add(design.name);
      succeeded++;
      console.log(`  [${succeeded}/${N}] ${word} -> ${design.name} (${(buf.length / 1024).toFixed(0)} KB)`);
    } catch (e) {
      console.error(`  [error] ${word} (${design.name}):`, (e as Error).message);
    }
  }

  console.log(`\n=== Full deck sanity check ===`);
  console.log(`Words rendered: ${succeeded}/${N}`);
  console.log(`Distinct designs used: ${usedDesigns.size}/${ALL_DESIGNS.length}`);
  console.log(`Designs: ${[...usedDesigns].sort().join(', ')}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
