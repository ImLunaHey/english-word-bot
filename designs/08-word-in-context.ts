import type { Design } from './types';
import { textPath, measureText } from './fonts';

const BG = '#f7f3ed';
const INK = '#2a2317';
const RULE = '#c4b896';
const META = '#6b5d42';
const HIGHLIGHT = '#f0d97a';

function wrapWords(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) {
      if (cur) lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur.trim());
  return lines;
}

export const wordInContext: Design = {
  name: 'word-in-context',
  canRender: (d) => !!d.example,
  render: ({ data, watermark, width, height }) => {
    const padding = 80;
    const fontSize = 26;
    const lineHeight = 38;

    const example = `"${data.example}"`;
    const lines = wrapWords(example, 38);
    const startY = padding + 80;

    const wordLower = data.word.toLowerCase();
    const linePieces: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const y = startY + i * lineHeight;
      const lc = line.toLowerCase();
      const idx = lc.indexOf(wordLower);

      if (idx === -1) {
        const p = textPath(line, 'serif-italic', fontSize, padding, y, 'left', 'middle');
        linePieces.push(`<path d="${p}" fill="${INK}"/>`);
      } else {
        const before = line.slice(0, idx);
        const match = line.slice(idx, idx + wordLower.length);
        const after = line.slice(idx + wordLower.length);
        const beforeW = before ? measureText(before, 'serif-italic', fontSize).width : 0;
        const matchW = measureText(match, 'sans-bold', fontSize).width;

        linePieces.push(`<rect x="${padding + beforeW - 4}" y="${y - fontSize / 2 - 4}" width="${matchW + 8}" height="${fontSize + 8}" fill="${HIGHLIGHT}"/>`);

        if (before) {
          const p = textPath(before, 'serif-italic', fontSize, padding, y, 'left', 'middle');
          linePieces.push(`<path d="${p}" fill="${INK}"/>`);
        }
        const matchPath = textPath(match, 'sans-bold', fontSize, padding + beforeW, y, 'left', 'middle');
        linePieces.push(`<path d="${matchPath}" fill="${INK}"/>`);
        if (after) {
          const p = textPath(after, 'serif-italic', fontSize, padding + beforeW + matchW, y, 'left', 'middle');
          linePieces.push(`<path d="${p}" fill="${INK}"/>`);
        }
      }
    }

    const ruleY = startY + lines.length * lineHeight + 30;
    const wordPath = textPath(data.word, 'sans-bold', 28, padding, ruleY + 40, 'left', 'middle');
    const meta = `${data.partOfSpeech || 'word'} · ${(data.definition || '').slice(0, 50)}${data.definition && data.definition.length > 50 ? '...' : ''}`;
    const metaPath = textPath(meta, 'sans-bold', 14, padding, ruleY + 70, 'left', 'middle');

    const watermarkPath = textPath(watermark, 'mono', 13, width / 2, height - 40, 'center', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        ${linePieces.join('\n')}
        <line x1="${padding}" y1="${ruleY}" x2="${width - padding}" y2="${ruleY}" stroke="${RULE}" stroke-width="0.5"/>
        <path d="${wordPath}" fill="${INK}"/>
        <path d="${metaPath}" fill="${META}"/>
        <path d="${watermarkPath}" fill="${META}"/>
      </svg>
    `;
  },
};
