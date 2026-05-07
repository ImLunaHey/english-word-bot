import sharp from 'sharp';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import wordListPath from 'word-list';
import { fetchWordData } from './dictionary';
import { ALL_DESIGNS, renderDesign } from './designs';

const WIDTH = 800;
const HEIGHT = 800;
const WATERMARK = '@englishwordbot.bsky.social';
const OUT_DIR = process.env.TEST_OUTPUT_DIR ?? './test-output';
const WORDS = readFileSync(wordListPath, 'utf8').split('\n').filter(Boolean);

async function renderToBuffer(svg: string): Promise<Buffer> {
  return sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
  })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

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
    const svg = renderDesign(design, { data: chosen.data, watermark: WATERMARK, width: WIDTH, height: HEIGHT });
    const buf = await renderToBuffer(svg);
    const out = join(OUT_DIR, `every-${design.name}-${chosen.word}.png`);
    writeFileSync(out, buf);
    console.log(`  ${design.name} <- ${chosen.word}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
