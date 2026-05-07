import sharp from 'sharp';
import { fetchWordData } from './dictionary';
import { pickDesign, renderDesign } from './designs';

const WIDTH = 800;
const HEIGHT = 800;

export async function createWordImage(word: string, watermark: string): Promise<Buffer | null> {
  const data = await fetchWordData(word);
  if (!data) return null;

  const design = pickDesign(data);
  const svg = renderDesign(design, { data, watermark, width: WIDTH, height: HEIGHT });

  return sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}
