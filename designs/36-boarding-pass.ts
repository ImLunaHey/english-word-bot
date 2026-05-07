import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, extractCentury, langCode, splitWord, truncate } from './utils';

const BACKDROP = '#2a4a8a';
const PAPER = '#ffffff';
const INK = '#1a1a1a';
const ACCENT = '#c44d3c';
const LABEL = '#888888';
const SOFT = '#555555';
const RULE = '#dddddd';
const STUB_BG = '#2a4a8a';
const STUB_TEXT = '#ffffff';
const BLUE = '#2a4a8a';

export const boardingPass: Design = {
  name: 'boarding-pass',
  canRender: () => true,
  render: ({ data, watermark, width, height }) => {
    const passW = width - 60;
    const passH = Math.round(height * 0.7);
    const passX = (width - passW) / 2;
    const passY = (height - passH) / 2;
    const stubW = Math.round(passW / 3.4);
    const mainW = passW - stubW;
    const mainX = passX;
    const stubX = passX + mainW;

    const padX = 22;
    const innerLeft = mainX + padX;
    const innerRight = mainX + mainW - padX;

    let y = passY + 30;
    const titleSize = 16;
    const titlePath = textPath('EWB AIRWAYS', 'mono', titleSize, innerLeft, y, 'left', 'middle');
    const titleSubPath = textPath('BOARDING PASS', 'mono', 10, innerRight, y, 'right', 'middle');
    y += 12;
    const titleRule = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${BLUE}" stroke-width="2"/>`;
    y += 24;

    const passengerLabel = textPath('PASSENGER', 'mono', 9, innerLeft, y, 'left', 'middle');
    const classLabel = textPath('CLASS', 'mono', 9, innerRight, y, 'right', 'middle');
    y += 18;
    const passengerSize = fitFontSize(data.word, 'sans-bold', mainW * 0.6, 22, 14);
    const passengerPath = textPath(data.word, 'sans-bold', passengerSize, innerLeft, y, 'left', 'middle');
    const partLabel = (data.partOfSpeech || 'WORD').toUpperCase();
    const classSize = fitFontSize(partLabel, 'sans-bold', mainW * 0.3, 18, 12);
    const classPath = textPath(partLabel, 'sans-bold', classSize, innerRight, y, 'right', 'middle');
    y += 30;

    const ruleA = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${RULE}" stroke-width="1"/>`;
    y += 22;

    const fromCode = langCode(data.originLanguage);
    const toCode = 'ENG';
    const fromX = innerLeft;
    const toX = innerRight;
    const arrowX = mainX + mainW / 2;
    const fromLabelPath = textPath('FROM', 'mono', 9, fromX, y, 'left', 'middle');
    const toLabelPath = textPath('TO', 'mono', 9, toX, y, 'right', 'middle');
    y += 22;
    const fromCodePath = textPath(fromCode, 'sans-bold', 24, fromX, y, 'left', 'middle');
    const toCodePath = textPath(toCode, 'sans-bold', 24, toX, y, 'right', 'middle');
    const arrowPath = textPath('->', 'sans-bold', 22, arrowX, y, 'center', 'middle');
    y += 18;
    const fromMeta = `${data.originLanguage ?? 'unknown'}${extractCentury(data.etymology) ? ` · ${extractCentury(data.etymology)}` : ''}`;
    const fromMetaSize = fitFontSize(fromMeta, 'mono', mainW * 0.4, 11, 8);
    const fromMetaPath = textPath(fromMeta, 'mono', fromMetaSize, fromX, y, 'left', 'middle');
    const toMetaPath = textPath('English · today', 'mono', 11, toX, y, 'right', 'middle');
    y += 24;

    const ruleB = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${RULE}" stroke-width="1"/>`;
    y += 20;

    const colW = (innerRight - innerLeft) / 3;
    const pronLabel = textPath('PRON', 'mono', 9, innerLeft, y, 'left', 'middle');
    const lenLabel = textPath('LEN', 'mono', 9, innerLeft + colW, y, 'left', 'middle');
    const seatLabel = textPath('SEAT', 'mono', 9, innerLeft + colW * 2, y, 'left', 'middle');
    y += 18;
    const pronText = data.ipa ? `/${data.ipa}/` : '—';
    const pronSize = fitFontSize(pronText, 'mono', colW - 8, 11, 8);
    const pronPath = textPath(pronText, 'mono', pronSize, innerLeft, y, 'left', 'middle');
    const lenPath = textPath(`${data.word.length} ch`, 'mono', 11, innerLeft + colW, y, 'left', 'middle');
    const seatPath = textPath(entryNumber(data.word), 'mono', 11, innerLeft + colW * 2, y, 'left', 'middle');
    y += 24;

    let defPath = '';
    if (data.definition) {
      const def = truncate(data.definition, 60);
      const defSize = fitFontSize(def, 'mono', innerRight - innerLeft, 11, 9);
      defPath = textPath(def, 'mono', defSize, innerLeft, y + 6, 'left', 'middle');
    }

    const stubPadX = 16;
    const stubInnerLeft = stubX + stubPadX;
    const stubInnerW = stubW - stubPadX * 2;
    const stubCx = stubX + stubW / 2;
    let sy = passY + 30;
    const stubLabelPath = textPath('PASSENGER', 'mono', 9, stubInnerLeft, sy, 'left', 'middle');
    sy += 18;
    const stubWordLines = splitWord(data.word);
    const longestStub = stubWordLines.reduce((a, b) => a.length > b.length ? a : b);
    const stubWordSize = fitFontSize(longestStub, 'sans-bold', stubInnerW, 18, 9);
    const stubLineH = stubWordSize * 1.05;
    const stubWordPaths = stubWordLines.map((line, i) => {
      const p = textPath(line, 'sans-bold', stubWordSize, stubInnerLeft, sy + stubLineH / 2 + i * stubLineH, 'left', 'middle');
      return `<path d="${p}" fill="${STUB_TEXT}"/>`;
    });
    sy += stubLineH * stubWordLines.length + 20;

    const bigNumY = passY + passH / 2;
    const bigNum = entryNumber(data.word);
    const bigNumPath = textPath(bigNum, 'sans-bold', 32, stubCx, bigNumY, 'center', 'middle');

    const stubFooterY = passY + passH - 22;
    const stubFooterPath = textPath(watermark.replace(/^@/, '').toUpperCase(), 'mono', 8, stubCx, stubFooterY, 'center', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BACKDROP}"/>
        <rect x="${mainX}" y="${passY}" width="${mainW}" height="${passH}" fill="${PAPER}"/>
        <rect x="${stubX}" y="${passY}" width="${stubW}" height="${passH}" fill="${STUB_BG}"/>
        <line x1="${stubX}" y1="${passY}" x2="${stubX}" y2="${passY + passH}" stroke="${PAPER}" stroke-width="2" stroke-dasharray="4 4"/>
        <path d="${titlePath}" fill="${BLUE}"/>
        <path d="${titleSubPath}" fill="${LABEL}"/>
        ${titleRule}
        <path d="${passengerLabel}" fill="${LABEL}"/>
        <path d="${classLabel}" fill="${LABEL}"/>
        <path d="${passengerPath}" fill="${INK}"/>
        <path d="${classPath}" fill="${ACCENT}"/>
        ${ruleA}
        <path d="${fromLabelPath}" fill="${LABEL}"/>
        <path d="${toLabelPath}" fill="${LABEL}"/>
        <path d="${fromCodePath}" fill="${INK}"/>
        <path d="${toCodePath}" fill="${INK}"/>
        <path d="${arrowPath}" fill="${ACCENT}"/>
        <path d="${fromMetaPath}" fill="${SOFT}"/>
        <path d="${toMetaPath}" fill="${SOFT}"/>
        ${ruleB}
        <path d="${pronLabel}" fill="${LABEL}"/>
        <path d="${lenLabel}" fill="${LABEL}"/>
        <path d="${seatLabel}" fill="${LABEL}"/>
        <path d="${pronPath}" fill="${INK}"/>
        <path d="${lenPath}" fill="${INK}"/>
        <path d="${seatPath}" fill="${INK}"/>
        ${defPath ? `<path d="${defPath}" fill="${SOFT}"/>` : ''}
        <path d="${stubLabelPath}" fill="${STUB_TEXT}" fill-opacity="0.7"/>
        ${stubWordPaths.join('\n')}
        <path d="${bigNumPath}" fill="${STUB_TEXT}"/>
        <path d="${stubFooterPath}" fill="${STUB_TEXT}" fill-opacity="0.7"/>
      </svg>
    `;
  },
};
