import type { Design } from './types';
import { textPath, fitFontSize, measureText } from './fonts';
import { entryNumber, truncate, wrapText } from './utils';

const BG = '#1a1a1a';
const CHROME = '#2a2a2a';
const TS = '#4a4a4a';
const MSG = '#c8c8c8';
const STRC = '#f4c478';
const BLOCK_BG = '#0a0a0a';
const ACCENT = '#f4c478';
const COMMENT = '#6affb0';
const SOFT = '#888888';
const SANS_TEXT = '#f5f3ec';

interface LogLine { ts: string; level: 'INFO' | 'OK' | 'WARN'; runs: Array<{ text: string; color: string }>; }

const LEVEL_BG: Record<LogLine['level'], string> = {
  INFO: '#2a4a8a',
  OK: '#2a8a4a',
  WARN: '#8a6a2a',
};

export const logOutput: Design = {
  name: 'log-output',
  canRender: () => true,
  render: ({ data, watermark, width, height }) => {
    const headerH = 32;
    const padX = 22;
    const fontSize = 13;
    const lineH = 24;

    const headerLeft = textPath('[ word.log ]', 'mono', 12, padX, headerH / 2, 'left', 'middle');
    const headerRight = textPath('v v v', 'mono', 12, width - padX, headerH / 2, 'right', 'middle');

    const logLines: LogLine[] = [
      { ts: '14:20:01', level: 'INFO', runs: [{ text: `fetching word #${entryNumber(data.word)}`, color: MSG }] },
      { ts: '14:20:02', level: 'OK', runs: [{ text: 'word: ', color: MSG }, { text: `"${data.word}"`, color: STRC }] },
      { ts: '14:20:02', level: 'INFO', runs: [{ text: 'querying wiktionary...', color: MSG }] },
      { ts: '14:20:03', level: 'OK', runs: [{ text: '200 — definition retrieved', color: MSG }] },
    ];
    if (data.definition && data.word.length > 9) {
      logLines.push({ ts: '14:20:03', level: 'WARN', runs: [{ text: 'rare word · usage uncommon', color: MSG }] });
    }

    const tagW = 50;
    const tagH = 16;

    let y = headerH + 28;

    const out: string[] = [];

    const renderLogLine = (line: LogLine) => {
      const tsPath = textPath(line.ts, 'mono', fontSize, padX, y, 'left', 'middle');
      out.push(`<path d="${tsPath}" fill="${TS}"/>`);
      const tsW = measureText(line.ts, 'mono', fontSize).width;

      const tagX = padX + tsW + 10;
      const tagY = y - tagH / 2;
      out.push(`<rect x="${tagX}" y="${tagY}" width="${tagW}" height="${tagH}" fill="${LEVEL_BG[line.level]}"/>`);
      const tagText = textPath(line.level, 'mono', 10, tagX + tagW / 2, tagY + tagH / 2, 'center', 'middle');
      out.push(`<path d="${tagText}" fill="white"/>`);

      let cursor = tagX + tagW + 12;
      for (const run of line.runs) {
        if (!run.text) continue;
        const p = textPath(run.text, 'mono', fontSize, cursor, y, 'left', 'middle');
        out.push(`<path d="${p}" fill="${run.color}"/>`);
        cursor += measureText(run.text, 'mono', fontSize).width;
      }
      y += lineH;
    };

    logLines.forEach(renderLogLine);

    y += 12;

    const blockX = padX;
    const blockW = width - padX * 2;
    const blockTop = y;
    const blockPadX = 18;
    const blockTextX = blockX + blockPadX + 6;

    const wordSize = fitFontSize(data.word, 'sans-bold', blockW - blockPadX * 2 - 6, 32, 18);
    let by = blockTop + 24;
    const wordPath = textPath(data.word, 'sans-bold', wordSize, blockTextX, by, 'left', 'middle');
    out.push(`<path d="${wordPath}" fill="${SANS_TEXT}" data-marker="block-word"/>`);
    by += wordSize / 2 + 14;

    const partIpa = [data.partOfSpeech || null, data.ipa ? `/${data.ipa}/` : null].filter(Boolean).join(' · ') || '—';
    const partIpaPath = textPath(partIpa, 'mono', 11, blockTextX, by, 'left', 'middle');
    out.push(`<path d="${partIpaPath}" fill="${SOFT}"/>`);
    by += 22;

    if (data.definition) {
      const defLines = wrapText(truncate(data.definition, 110), 50).slice(0, 2);
      defLines.forEach(line => {
        const lineSize = fitFontSize(line, 'sans-bold', blockW - blockPadX * 2 - 6, 13, 10);
        const p = textPath(line, 'sans-bold', lineSize, blockTextX, by, 'left', 'middle');
        out.push(`<path d="${p}" fill="${MSG}"/>`);
        by += 18;
      });
      by += 4;
    }

    if (data.originLanguage || data.etymology) {
      const origin = data.originLanguage ?? 'unknown source';
      const prefix = `// from ${origin} `;
      const prefixW = measureText(prefix, 'mono', 11).width;
      const pp = textPath(prefix, 'mono', 11, blockTextX, by, 'left', 'middle');
      out.push(`<path d="${pp}" fill="${COMMENT}"/>`);

      const etymHint = data.etymology ? extractKeyword(data.etymology) : null;
      if (etymHint) {
        const ep = textPath(etymHint, 'mono', 11, blockTextX + prefixW, by, 'left', 'middle');
        out.push(`<path d="${ep}" fill="${ACCENT}"/>`);
      }
      by += 18;
    }

    by += 10;
    const blockH = by - blockTop;
    const blockRect = `<rect x="${blockX}" y="${blockTop}" width="${blockW}" height="${blockH}" fill="${BLOCK_BG}"/>`;
    const accentBar = `<rect x="${blockX}" y="${blockTop}" width="3" height="${blockH}" fill="${ACCENT}"/>`;

    y = blockTop + blockH + 14;

    if (y < height - 30) {
      renderLogLine({ ts: '14:20:04', level: 'OK', runs: [{ text: 'posting to bluesky...', color: MSG }] });
    }

    const watermarkPath = textPath(watermark, 'mono', 10, width - padX, height - 16, 'right', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <rect x="0" y="0" width="${width}" height="${headerH}" fill="${CHROME}"/>
        <path d="${headerLeft}" fill="${SOFT}"/>
        <path d="${headerRight}" fill="${TS}"/>
        ${blockRect}
        ${accentBar}
        ${out.join('\n')}
        <path d="${watermarkPath}" fill="${TS}"/>
      </svg>
    `;
  },
};

function extractKeyword(etymology: string): string | null {
  const m = etymology.match(/\b([a-zāēīōū]{4,})\b/);
  return m ? `"${m[1]}"` : null;
}
