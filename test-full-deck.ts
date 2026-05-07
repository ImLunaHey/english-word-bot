import sharp from 'sharp';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import wordListPath from 'word-list';
import { fetchWordData } from './dictionary';
import { ALL_DESIGNS, pickDesign, renderDesign } from './designs';

const WIDTH = 800;
const HEIGHT = 800;
const WATERMARK = '@englishwordbot.bsky.social';
const OUT_DIR = process.env.TEST_OUTPUT_DIR ?? './test-output';

async function renderToBuffer(svg: string): Promise<Buffer> {
  return sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
  })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

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
    const ctx = { data, watermark: WATERMARK, width: WIDTH, height: HEIGHT };
    try {
      const svg = renderDesign(design, ctx);
      const buf = await renderToBuffer(svg);
      const out = join(OUT_DIR, `deck-${String(succeeded + 1).padStart(2, '0')}-${word}-${design.name}.png`);
      writeFileSync(out, buf);
      usedDesigns.add(design.name);
      succeeded++;
      console.log(`  [${succeeded}/${N}] ${word} -> ${design.name}`);
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
