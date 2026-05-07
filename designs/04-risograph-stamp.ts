import type { Design } from './types';
import { textPath, fitFontSize, measureText } from './fonts';

const BG = '#f5e6d3';
const RED = '#c44d3c';
const GREEN = '#2d4a2b';
const BROWN = '#5a4a2e';

function starPolygon(cx: number, cy: number, outer: number, inner: number, points = 5): string {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    coords.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return coords.join(' ');
}

export const risographStamp: Design = {
  name: 'risograph-stamp',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const margin = 60;
    const padding = 50;

    let shortDef = data.definition.split('.')[0];
    if (shortDef.length > 60) shortDef = shortDef.slice(0, 57) + '...';

    const wordSize = fitFontSize(data.word, 'serif-italic', width - padding * 2, 100, 50);
    const wordPath = textPath(data.word, 'serif-italic', wordSize, width / 2, height / 2, 'center', 'middle');

    const headerText = 'WORD OF THE MOMENT';
    const headerSize = 14;
    const headerY = height / 2 - wordSize / 2 - 50;
    const headerPath = textPath(headerText, 'mono', headerSize, width / 2, headerY, 'center', 'middle');
    const headerW = measureText(headerText, 'mono', headerSize).width;
    const starOffset = headerW / 2 + 20;
    const starLeft = starPolygon(width / 2 - starOffset, headerY, 7, 3);
    const starRight = starPolygon(width / 2 + starOffset, headerY, 7, 3);
    const defPath = textPath(shortDef, 'serif-italic', 18, width / 2, height / 2 + wordSize / 2 + 50, 'center', 'middle');
    const watermarkPath = textPath(watermark, 'mono', 13, width / 2, height - 40, 'center', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <rect x="${margin}" y="${margin}" width="${width - margin * 2}" height="${height - margin * 2}" fill="none" stroke="${RED}" stroke-width="3" rx="6"/>
        <rect x="${margin + 8}" y="${margin + 8}" width="${width - margin * 2 - 16}" height="${height - margin * 2 - 16}" fill="none" stroke="${RED}" stroke-width="0.8" rx="3"/>
        <polygon points="${starLeft}" fill="${RED}"/>
        <polygon points="${starRight}" fill="${RED}"/>
        <path d="${headerPath}" fill="${RED}"/>
        <path d="${wordPath}" fill="${GREEN}"/>
        <line x1="${width / 2 - 50}" y1="${height / 2 + wordSize / 2 + 25}" x2="${width / 2 + 50}" y2="${height / 2 + wordSize / 2 + 25}" stroke="${RED}" stroke-width="1"/>
        <path d="${defPath}" fill="${BROWN}"/>
        <path d="${watermarkPath}" fill="${RED}" fill-opacity="0.6"/>
      </svg>
    `;
  },
};
