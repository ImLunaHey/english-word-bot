import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';

const BG = '#f0ee2a';
const INK = '#1a1a1a';

export const boldPoster: Design = {
  name: 'bold-poster',
  canRender: () => true,
  render: ({ data, watermark, width, height }) => {
    const padding = 50;
    const maxWidth = width - padding * 2;

    const maxPerLine = 14;
    const numLines = Math.max(1, Math.ceil(data.word.length / maxPerLine));
    let lines: string[];
    if (numLines === 1) {
      lines = [data.word];
    } else {
      const target = Math.ceil(data.word.length / numLines);
      lines = [];
      let cursor = 0;
      for (let i = 0; i < numLines; i++) {
        const remaining = data.word.length - cursor;
        const linesLeft = numLines - i;
        let take = Math.ceil(remaining / linesLeft);
        if (i < numLines - 1) {
          for (let off = 0; off < 3; off++) {
            if ('aeiouAEIOU'.includes(data.word[cursor + take + off] ?? '')) { take = take + off; break; }
            if ('aeiouAEIOU'.includes(data.word[cursor + take - off] ?? '')) { take = take - off; break; }
          }
        }
        lines.push(data.word.slice(cursor, cursor + take));
        cursor += take;
      }
    }

    const longest = lines.reduce((a, b) => a.length > b.length ? a : b);
    const wordSize = fitFontSize(longest, 'sans-bold', maxWidth, 220, 80);
    const lineHeight = wordSize * 0.92;
    const totalHeight = lineHeight * lines.length;
    const startY = (height - totalHeight) / 2 + lineHeight / 2;

    const linePaths = lines.map((line, i) => {
      const p = textPath(line, 'sans-bold', wordSize, padding, startY + i * lineHeight, 'left', 'middle');
      return `<path d="${p}" fill="${INK}"/>`;
    }).join('\n');

    const partLabel = (data.partOfSpeech || 'WORD').toUpperCase();
    const topLeft = textPath(partLabel, 'mono', 13, padding, padding, 'left', 'top');
    const topRight = textPath('NO. 0001', 'mono', 13, width - padding, padding, 'right', 'top');
    const bottomLeft = textPath('ENGLISHWORDBOT', 'mono', 13, padding, height - padding, 'left', 'middle');
    const bottomRight = textPath(watermark, 'mono', 13, width - padding, height - padding, 'right', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <path d="${topLeft}" fill="${INK}"/>
        <path d="${topRight}" fill="${INK}"/>
        ${linePaths}
        <path d="${bottomLeft}" fill="${INK}"/>
        <path d="${bottomRight}" fill="${INK}"/>
      </svg>
    `;
  },
};
