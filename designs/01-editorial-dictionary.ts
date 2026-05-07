import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';

const BG = '#f4efe6';
const INK = '#2a2317';
const RULE = '#c9b896';
const META = '#8a7a5c';
const BODY = '#4a3f28';
const ACCENT = '#6b5d42';

function wrapText(text: string, maxChars: number): string[] {
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
  if (cur) lines.push(cur);
  return lines;
}

export const editorialDictionary: Design = {
  name: 'editorial-dictionary',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const padding = 80;
    const wordSize = fitFontSize(data.word, 'serif', width - padding * 2, 110, 50);
    const wordPath = textPath(data.word, 'serif', wordSize, width / 2, height * 0.42, 'center', 'middle');

    const ipaText = data.ipa ? `/${data.ipa}/` : '';
    const partLabel = data.partOfSpeech ? data.partOfSpeech : '';
    const subline = [partLabel, ipaText].filter(Boolean).join(' · ');
    const sublinePath = subline
      ? textPath(subline, 'serif-italic', 22, width / 2, height * 0.42 + wordSize / 2 + 40, 'center', 'middle')
      : '';

    const lines = wrapText(data.definition, 48).slice(0, 3);
    const defStartY = height * 0.42 + wordSize / 2 + 90;
    const defPaths = lines.map((line, i) => {
      const p = textPath(line, 'serif', 22, width / 2, defStartY + i * 32, 'center', 'middle');
      return `<path d="${p}" fill="${BODY}"/>`;
    }).join('\n');

    const headerPath = textPath('AN ENGLISH DICTIONARY', 'mono', 14, width / 2, padding, 'center', 'top');
    const watermarkPath = textPath(watermark, 'mono', 14, width / 2, height - 40, 'center', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <path d="${headerPath}" fill="${META}"/>
        <line x1="${padding}" y1="${padding + 30}" x2="${width - padding}" y2="${padding + 30}" stroke="${RULE}" stroke-width="0.5"/>
        <path d="${wordPath}" fill="${INK}"/>
        ${sublinePath ? `<path d="${sublinePath}" fill="${ACCENT}"/>` : ''}
        ${defPaths}
        <path d="${watermarkPath}" fill="${META}"/>
      </svg>
    `;
  },
};
