import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, extractCentury, splitWord, todayISO, wrapText } from './utils';

const BG = '#0a0a14';
const NEON = '#00ff66';
const WHITE = '#ffffff';
const FOOTER_BG = 'rgba(0,255,102,0.1)';

export const vhsTitleCard: Design = {
  name: 'vhs-title-card',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const padX = 26;
    const innerLeft = padX;
    const innerRight = width - padX;
    const innerW = innerRight - innerLeft;

    const playPath = textPath('> PLAY', 'sans-bold', 13, innerLeft, 32, 'left', 'middle');
    const tapeModePath = textPath('SP   LP   EP', 'mono', 11, innerRight, 32, 'right', 'middle');

    let y = 100;
    const channelPath = textPath(`— CHANNEL ${entryNumber(data.word)} —`, 'mono', 11, innerLeft, y, 'left', 'middle');
    y += 30;

    const wordUpper = data.word.toUpperCase();
    const wordLines = splitWord(data.word).map(s => s.toUpperCase());
    if (wordUpper.length <= 8) wordLines.length = 0, wordLines.push(wordUpper);
    const longest = wordLines.reduce((a, b) => a.length > b.length ? a : b, '');
    const wordSize = fitFontSize(longest, 'sans-bold', innerW, 50, 18);
    const lineH = wordSize * 0.95;
    const wordPaths = wordLines.map((line, i) => {
      const py = y + i * lineH + lineH / 2;
      const p = textPath(line, 'sans-bold', wordSize, innerLeft, py, 'left', 'middle');
      return `<path d="${p}" fill="${WHITE}"/>`;
    });
    y += wordLines.length * lineH + 14;

    const subText = `${data.partOfSpeech || 'word'} · /${data.ipa ?? '—'}/`;
    const subSize = fitFontSize(subText, 'mono', innerW, 12, 9);
    const subPath = textPath(subText, 'mono', subSize, innerLeft, y, 'left', 'middle');
    y += 28;

    const defLines = wrapText(data.definition.toUpperCase(), 38).slice(0, 2);
    const defPaths = defLines.map((line) => {
      const lineSize = fitFontSize(line, 'sans-bold', innerW, 14, 10);
      const p = textPath(line, 'sans-bold', lineSize, innerLeft, y, 'left', 'middle');
      y += 22;
      return `<path d="${p}" fill="${WHITE}"/>`;
    });

    const statusY = height - 70;
    const recCx = innerLeft + 8;
    const recCircle = `<circle cx="${recCx}" cy="${statusY}" r="6" fill="${NEON}"/>`;
    const recPath = textPath('REC', 'sans-bold', 12, innerLeft + 22, statusY, 'left', 'middle');
    const timeText = `${todayISO()} 14:20:07`;
    const timeSize = fitFontSize(timeText, 'mono', innerW * 0.4, 11, 8);
    const timePath = textPath(timeText, 'mono', timeSize, width / 2, statusY, 'center', 'middle');
    const originText = `${extractCentury(data.etymology) ?? '—'} / ${(data.originLanguage ?? 'UNKNOWN').toUpperCase()}`;
    const originSize = fitFontSize(originText, 'mono', innerW * 0.35, 11, 8);
    const originPath = textPath(originText, 'mono', originSize, innerRight, statusY, 'right', 'middle');

    const footerH = 26;
    const footerY = height - footerH / 2;
    const footerLeft = textPath('EWB-VHS', 'mono', 9, padX, footerY, 'left', 'middle');
    const footerRight = textPath(watermark.replace(/^@/, '').toUpperCase(), 'mono', 9, width - padX, footerY, 'right', 'middle');

    const scanlines: string[] = [];
    for (let yy = 0; yy < height; yy += 4) {
      scanlines.push(`<line x1="0" y1="${yy}" x2="${width}" y2="${yy}" stroke="white" stroke-opacity="0.04"/>`);
    }

    void FOOTER_BG;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <path d="${playPath}" fill="${NEON}"/>
        <path d="${tapeModePath}" fill="${WHITE}"/>
        <path d="${channelPath}" fill="${NEON}"/>
        ${wordPaths.join('\n')}
        <path d="${subPath}" fill="${NEON}"/>
        ${defPaths.join('\n')}
        ${recCircle}
        <path d="${recPath}" fill="${NEON}"/>
        <path d="${timePath}" fill="${WHITE}"/>
        <path d="${originPath}" fill="${NEON}"/>
        ${scanlines.join('\n')}
        <rect x="0" y="${height - footerH}" width="${width}" height="${footerH}" fill="${NEON}" fill-opacity="0.1"/>
        <path d="${footerLeft}" fill="${NEON}"/>
        <path d="${footerRight}" fill="${NEON}"/>
      </svg>
    `;
  },
};
