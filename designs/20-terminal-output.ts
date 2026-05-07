import type { Design } from './types';
import { textPath, measureText } from './fonts';
import { entryNumber, truncate } from './utils';

const BG = '#0a0e14';
const CHROME = '#1a1f28';
const TEXT = '#c8d4e0';
const COMMENT = '#888888';
const PROMPT = '#5fb3d7';
const FN = '#a8c98a';
const STR = '#f4c478';
const KEY = '#d782e8';
const PUNCT = '#888888';
const VAL = '#f5f3ec';

interface Run { text: string; color: string; }

function runWidth(runs: Run[], size: number): number {
  let w = 0;
  for (const r of runs) w += measureText(r.text, 'mono', size).width;
  return w;
}

function fitRuns(runs: Run[], maxWidth: number, maxSize: number, minSize: number): number {
  let size = maxSize;
  while (size > minSize) {
    if (runWidth(runs, size) <= maxWidth) return size;
    size -= 1;
  }
  return minSize;
}

function renderRuns(runs: Run[], size: number, x: number, y: number): string {
  let cursor = x;
  const parts: string[] = [];
  for (const r of runs) {
    if (r.text) {
      const p = textPath(r.text, 'mono', size, cursor, y, 'left', 'middle');
      parts.push(`<path d="${p}" fill="${r.color}"/>`);
      cursor += measureText(r.text, 'mono', size).width;
    }
  }
  return parts.join('\n');
}

export const terminalOutput: Design = {
  name: 'terminal-output',
  canRender: () => true,
  render: ({ data, watermark, width, height }) => {
    const headerH = 36;
    const footerH = 32;
    const padX = 22;
    const bodyTop = headerH + 22;
    const bodyMaxWidth = width - padX * 2;
    const lineH = 28;
    const fontSize = 16;

    const dotR = 6;
    const dotY = headerH / 2;
    const dotXs = [padX, padX + 22, padX + 44];

    const titleText = '~/words/today';
    const titleSize = 13;
    const titlePath = textPath(titleText, 'mono', titleSize, padX + 64, dotY, 'left', 'middle');

    const lines: Run[][] = [];
    lines.push([
      { text: '$ ', color: PROMPT },
      { text: 'define ', color: FN },
      { text: `"${data.word}"`, color: STR },
    ]);
    lines.push([{ text: '→ querying wiktionary...', color: COMMENT }]);
    lines.push([{ text: '', color: TEXT }]);
    lines.push([
      { text: 'word', color: KEY }, { text: ': ', color: PUNCT }, { text: data.word, color: VAL },
    ]);
    if (data.partOfSpeech) {
      lines.push([
        { text: 'type', color: KEY }, { text: ': ', color: PUNCT }, { text: data.partOfSpeech, color: STR },
      ]);
    }
    if (data.ipa) {
      lines.push([
        { text: 'ipa', color: KEY }, { text: ': ', color: PUNCT }, { text: `/${data.ipa}/`, color: FN },
      ]);
    }
    if (data.definition) {
      lines.push([
        { text: 'def', color: KEY }, { text: ': ', color: PUNCT }, { text: truncate(data.definition.toLowerCase(), 38), color: VAL },
      ]);
    }
    if (data.originLanguage || data.etymology) {
      const origin = data.originLanguage ? data.originLanguage.toLowerCase() : 'unknown';
      lines.push([
        { text: 'from', color: KEY }, { text: ': ', color: PUNCT }, { text: origin, color: PROMPT },
      ]);
    }
    lines.push([{ text: '', color: TEXT }]);
    lines.push([{ text: '$ ', color: PROMPT }]);

    let useSize = fontSize;
    for (const lineRuns of lines) {
      useSize = Math.min(useSize, fitRuns(lineRuns, bodyMaxWidth, fontSize, 10));
    }

    const linePaths = lines.map((runs, i) =>
      runs.length ? renderRuns(runs, useSize, padX, bodyTop + i * lineH + lineH / 2) : ''
    ).filter(Boolean).join('\n');

    const promptLastRuns = lines[lines.length - 1];
    const promptLastY = bodyTop + (lines.length - 1) * lineH + lineH / 2;
    const promptLastWidth = runWidth(promptLastRuns, useSize);
    const cursorX = padX + promptLastWidth;
    const cursorY = promptLastY - useSize * 0.55;

    const footerY = height - footerH / 2;
    const footerText = `${watermark.replace(/^@/, '')} · ${entryNumber(data.word)}`;
    const footerSize = 11;
    const footerPath = textPath(footerText, 'mono', footerSize, padX, footerY, 'left', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <rect x="0" y="0" width="${width}" height="${headerH}" fill="${CHROME}"/>
        <circle cx="${dotXs[0]}" cy="${dotY}" r="${dotR}" fill="#ff5f56"/>
        <circle cx="${dotXs[1]}" cy="${dotY}" r="${dotR}" fill="#ffbd2e"/>
        <circle cx="${dotXs[2]}" cy="${dotY}" r="${dotR}" fill="#27c93f"/>
        <path d="${titlePath}" fill="${COMMENT}"/>
        ${linePaths}
        <rect x="${cursorX}" y="${cursorY}" width="${useSize * 0.5}" height="${useSize * 1.1}" fill="${TEXT}"/>
        <line x1="0" y1="${height - footerH}" x2="${width}" y2="${height - footerH}" stroke="${CHROME}" stroke-width="1"/>
        <path d="${footerPath}" fill="#555"/>
      </svg>
    `;
  },
};
