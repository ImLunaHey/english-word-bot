import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, extractCentury, posAbbrev, truncate } from './utils';

const BG = '#2a3540';
const PAPER = '#f4ead0';
const INK = '#1a1a1a';
const SOFT = '#5a3a1a';
const META = '#8a6a3a';
const SHADOW = 'rgba(0,0,0,0.35)';
const RULE = '#8a6a3a';

function elementSymbol(word: string): string {
  if (!word) return '??';
  const first = word[0].toUpperCase();
  const m = word.slice(1).match(/[bcdfglmnprstv]/i);
  const second = m ? m[0].toLowerCase() : (word[1] ?? word[0] ?? '').toLowerCase();
  return first + second;
}

export const periodicElement: Design = {
  name: 'periodic-element',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const cardW = Math.round(width * 0.78);
    const cardH = Math.round(cardW * 0.95);
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;
    const padX = 22;
    const innerLeft = cardX + padX;
    const innerRight = cardX + cardW - padX;
    const innerW = cardW - padX * 2;
    const cx = cardX + cardW / 2;

    const cornerY = cardY + 26;
    const numText = entryNumber(data.word);
    const numPath = textPath(numText, 'mono', 18, innerLeft, cornerY, 'left', 'middle');
    const lettersText = String(data.word.length);
    const lettersPath = textPath(lettersText, 'mono', 14, innerRight, cornerY, 'right', 'middle');
    const lettersLabelPath = textPath('letters', 'mono', 8, innerRight, cornerY + 14, 'right', 'middle');

    const symbol = elementSymbol(data.word);
    const symbolY = cardY + cardH * 0.46;
    const symbolSize = fitFontSize(symbol, 'sans-bold', innerW * 0.7, 90, 36);
    const symbolPath = textPath(symbol, 'sans-bold', symbolSize, cx, symbolY, 'center', 'middle');

    const wordY = symbolY + symbolSize / 2 + 22;
    const wordSize = fitFontSize(data.word, 'serif-italic', innerW, 22, 12);
    const wordPath = textPath(data.word, 'serif-italic', wordSize, cx, wordY, 'center', 'middle');

    const ipaY = wordY + wordSize / 2 + 16;
    const ipaText = data.ipa ? `/${data.ipa}/` : '—';
    const ipaSize = fitFontSize(ipaText, 'mono', innerW * 0.85, 11, 8);
    const ipaPath = textPath(ipaText, 'mono', ipaSize, cx, ipaY, 'center', 'middle');

    const ruleY = cardY + cardH - 88;
    const ruleLine = `<line x1="${innerLeft}" y1="${ruleY}" x2="${innerRight}" y2="${ruleY}" stroke="${RULE}" stroke-width="0.5"/>`;

    const metaY = ruleY + 20;
    const leftMeta = `${data.partOfSpeech || 'word'} · ${data.partOfSpeech ? posAbbrev(data.partOfSpeech) : 'n.'}`;
    const rightMeta = `${extractCentury(data.etymology) ?? '—'} · ${(data.originLanguage ?? '—').toUpperCase()}`;
    const leftMetaSize = fitFontSize(leftMeta, 'mono', innerW * 0.45, 10, 8);
    const rightMetaSize = fitFontSize(rightMeta, 'mono', innerW * 0.45, 10, 8);
    const leftMetaPath = textPath(leftMeta, 'mono', leftMetaSize, innerLeft, metaY, 'left', 'middle');
    const rightMetaPath = textPath(rightMeta, 'mono', rightMetaSize, innerRight, metaY, 'right', 'middle');

    const defText = `"${truncate(data.definition, 60)}"`;
    const defSize = fitFontSize(defText, 'serif-italic', innerW, 11, 9);
    const defY = metaY + 22;
    const defPath = textPath(defText, 'serif-italic', defSize, cx, defY, 'center', 'middle');

    const footerText = `EWB · ${entryNumber(data.word)}`;
    const footerSize = fitFontSize(footerText, 'mono', innerW, 9, 7);
    const footerY = cardY + cardH - 14;
    const footerPath = textPath(footerText, 'mono', footerSize, cx, footerY, 'center', 'middle');

    const watermarkPath = textPath(watermark, 'mono', 9, width / 2, height - 14, 'center', 'middle');

    void SOFT;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <rect x="${cardX + 6}" y="${cardY + 6}" width="${cardW}" height="${cardH}" fill="${SHADOW}"/>
        <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
        <path d="${numPath}" fill="${INK}"/>
        <path d="${lettersPath}" fill="${META}"/>
        <path d="${lettersLabelPath}" fill="${META}"/>
        <path d="${symbolPath}" fill="${INK}"/>
        <path d="${wordPath}" fill="${INK}"/>
        <path d="${ipaPath}" fill="${META}"/>
        ${ruleLine}
        <path d="${leftMetaPath}" fill="${META}"/>
        <path d="${rightMetaPath}" fill="${META}"/>
        <path d="${defPath}" fill="${INK}"/>
        <path d="${footerPath}" fill="${META}"/>
        <path d="${watermarkPath}" fill="${PAPER}" fill-opacity="0.5"/>
      </svg>
    `;
  },
};
