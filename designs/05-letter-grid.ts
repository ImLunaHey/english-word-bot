import type { Design } from './types';
import { textPath } from './fonts';

const BG = '#fafaf7';
const TILE = '#2d2d2d';
const TILE_TEXT = '#fafaf7';
const META = '#888888';

export const letterGrid: Design = {
  name: 'letter-grid',
  canRender: () => true,
  render: ({ data, watermark, width, height }) => {
    const letters = data.word.split('');
    const padding = 60;
    const maxCols = Math.min(letters.length, 8);
    const rows = Math.ceil(letters.length / maxCols);
    const gap = 10;

    const availableW = width - padding * 2;
    const tileSize = Math.min(
      (availableW - gap * (maxCols - 1)) / maxCols,
      120
    );

    const gridW = tileSize * maxCols + gap * (maxCols - 1);
    const gridH = tileSize * rows + gap * (rows - 1);
    const startX = (width - gridW) / 2;
    const startY = (height - gridH) / 2 - 20;

    const tiles = letters.map((ch, i) => {
      const col = i % maxCols;
      const row = Math.floor(i / maxCols);
      const x = startX + col * (tileSize + gap);
      const y = startY + row * (tileSize + gap);
      const charPath = textPath(ch.toUpperCase(), 'sans-bold', tileSize * 0.55, x + tileSize / 2, y + tileSize / 2, 'center', 'middle');
      return `
        <rect x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" fill="${TILE}" rx="6"/>
        <path d="${charPath}" fill="${TILE_TEXT}"/>
      `;
    }).join('\n');

    const wordLabel = textPath(data.word, 'sans-bold', 16, padding, height - 80, 'left', 'middle');
    const metaLabel = textPath(`${letters.length} letters · ${data.partOfSpeech || 'word'}`, 'sans-bold', 14, width - padding, height - 80, 'right', 'middle');
    const watermarkPath = textPath(watermark, 'mono', 13, width / 2, height - 40, 'center', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        ${tiles}
        <path d="${wordLabel}" fill="#222"/>
        <path d="${metaLabel}" fill="${META}"/>
        <path d="${watermarkPath}" fill="${META}"/>
      </svg>
    `;
  },
};
