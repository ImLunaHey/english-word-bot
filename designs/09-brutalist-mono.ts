import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';

const BG = '#e8e6df';
const INK = '#1a1a1a';

export const brutalistMono: Design = {
  name: 'brutalist-mono',
  canRender: () => true,
  render: ({ data, watermark, width, height }) => {
    const stripH = 70;
    const padding = 50;
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

    const wordSize = fitFontSize(data.word, 'sans-bold', width - padding * 2, 110, 50);
    const wordPath = textPath(data.word, 'sans-bold', wordSize, padding, height / 2 - 20, 'left', 'middle');

    let defPath = '';
    if (data.definition) {
      const short = data.definition.length > 70 ? data.definition.slice(0, 67) + '...' : data.definition;
      defPath = textPath(`[${(data.partOfSpeech || 'WORD').toUpperCase()}] ${short.toUpperCase()}`, 'mono', 13, padding, height / 2 + wordSize / 2 + 10, 'left', 'middle');
    }

    const topLeft = textPath('SPECIMEN/0001', 'mono', 13, padding, stripH / 2, 'left', 'middle');
    const topRight = textPath(today, 'mono', 13, width - padding, stripH / 2, 'right', 'middle');

    const langLabel = data.originLanguage ? data.originLanguage.toUpperCase() : '—';
    const bottomLeft = textPath(langLabel, 'mono', 13, padding, height - stripH / 2, 'left', 'middle');
    const bottomRight = textPath(watermark, 'mono', 13, width - padding, height - stripH / 2, 'right', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <line x1="0" y1="${stripH}" x2="${width}" y2="${stripH}" stroke="${INK}" stroke-width="1.5"/>
        <line x1="0" y1="${height - stripH}" x2="${width}" y2="${height - stripH}" stroke="${INK}" stroke-width="1.5"/>
        <path d="${topLeft}" fill="${INK}"/>
        <path d="${topRight}" fill="${INK}"/>
        <path d="${wordPath}" fill="${INK}"/>
        ${defPath ? `<path d="${defPath}" fill="${INK}"/>` : ''}
        <path d="${bottomLeft}" fill="${INK}"/>
        <path d="${bottomRight}" fill="${INK}"/>
      </svg>
    `;
  },
};
