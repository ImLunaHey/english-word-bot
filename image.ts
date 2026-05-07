import sharp from 'sharp';
import { fetchWordData } from './dictionary';
import { pickDesign, renderDesign } from './designs';

export const DESIGN_WIDTH = 800;
export const DESIGN_HEIGHT = 800;
export const RENDER_SCALE = 3;
export const RENDER_WIDTH = DESIGN_WIDTH * RENDER_SCALE;
export const RENDER_HEIGHT = DESIGN_HEIGHT * RENDER_SCALE;

export async function rasterizeSvg(svg: string): Promise<Buffer> {
  const scaledSvg = svg.replace(
    /<svg\b[^>]*>/,
    `<svg width="${RENDER_WIDTH}" height="${RENDER_HEIGHT}" viewBox="0 0 ${DESIGN_WIDTH} ${DESIGN_HEIGHT}" xmlns="http://www.w3.org/2000/svg">`,
  );

  return sharp({
    create: {
      width: RENDER_WIDTH,
      height: RENDER_HEIGHT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([{ input: Buffer.from(scaledSvg), top: 0, left: 0 }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

export async function createWordImage(word: string, watermark: string): Promise<Buffer | null> {
  const data = await fetchWordData(word);
  if (!data) return null;

  const design = pickDesign(data);
  const svg = renderDesign(design, { data, watermark, width: DESIGN_WIDTH, height: DESIGN_HEIGHT });
  return rasterizeSvg(svg);
}
