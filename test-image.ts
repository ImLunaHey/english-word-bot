import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
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
  const word = process.argv[2] ?? 'subarration';
  const mode = process.argv[3] ?? 'random'; // 'random' | 'all' | <design name>

  const data = await fetchWordData(word);
  if (!data) {
    console.error(`No dictionary data for "${word}".`);
    process.exit(1);
  }

  console.log(`Word: ${word}`);
  console.log(`  partOfSpeech: ${data.partOfSpeech || '(none)'}`);
  console.log(`  ipa: ${data.ipa ?? '(none)'}`);
  console.log(`  originLanguage: ${data.originLanguage ?? '(none)'}`);
  console.log(`  example: ${data.example ?? '(none)'}`);
  console.log(`  etymology: ${data.etymology ? data.etymology.slice(0, 80) + (data.etymology.length > 80 ? '...' : '') : '(none)'}`);
  console.log(`  definition: ${data.definition.slice(0, 80)}${data.definition.length > 80 ? '...' : ''}`);

  const ctx = { data, watermark: WATERMARK, width: WIDTH, height: HEIGHT };

  mkdirSync(OUT_DIR, { recursive: true });

  if (mode === 'all') {
    for (const design of ALL_DESIGNS) {
      if (!design.canRender(data)) {
        console.log(`  skip ${design.name} (cannot render)`);
        continue;
      }
      const svg = renderDesign(design, ctx);
      const buf = await renderToBuffer(svg);
      const out = join(OUT_DIR, `${word}-${design.name}.png`);
      writeFileSync(out, buf);
      console.log(`  wrote ${out}`);
    }
    return;
  }

  const named = ALL_DESIGNS.find(d => d.name === mode);
  const design = named ?? pickDesign(data);
  const svg = renderDesign(design, ctx);
  const buf = await renderToBuffer(svg);
  const out = join(OUT_DIR, `${word}-${design.name}.png`);
  writeFileSync(out, buf);
  console.log(`Wrote ${out} (design: ${design.name})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
