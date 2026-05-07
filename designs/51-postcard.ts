import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, hash, truncate, wrapText } from './utils';

const BG = '#d8c8a0';
const LEFT_PAPER = '#f4ead0';
const INK = '#2a1a0a';
const META = '#5a3a1a';
const RULE = '#5a3a1a';

function verbFromDef(def: string): string {
  const m = def.match(/\b(?:to\s+)?([a-z]+ing|[a-z]+ed)\b/i);
  if (m) return m[0].toLowerCase();
  return 'in its natural habitat';
}

export const postcard: Design = {
  name: 'postcard',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const halfW = width / 2;
    const padL = 20;
    const padR = 20;

    const headerLeftPath = textPath('POST CARD', 'mono', 9, padL, 30, 'left', 'middle');
    const headerLeftRightPath = textPath('VINTAGE EDITION', 'mono', 9, halfW - padL, 30, 'right', 'middle');

    const noteText = `Dear Reader,
Greetings from the world of words! Today I write to you of a curious specimen, observed ${verbFromDef(data.definition)}. Wish you were here.
Yours, EWB`;

    const paragraphs = noteText.split('\n');
    const allLines: string[] = [];
    paragraphs.forEach((para, idx) => {
      const wrapped = wrapText(para, 26);
      wrapped.forEach(l => allLines.push(l));
      if (idx < paragraphs.length - 1) allLines.push('');
    });

    let y = 60;
    const noteLineH = 18;
    const notePaths = allLines.slice(0, 16).map((line) => {
      if (!line) { y += noteLineH; return ''; }
      const lineSize = fitFontSize(line, 'serif-italic', halfW - padL * 2, 12, 9);
      const p = textPath(line, 'serif-italic', lineSize, padL, y, 'left', 'middle');
      y += noteLineH;
      return `<path d="${p}" fill="${INK}"/>`;
    }).filter(Boolean);

    const stampX = width - padR - 60;
    const stampY = 22;
    const stampW = 60;
    const stampH = 26;
    const stampRect = `<rect x="${stampX}" y="${stampY}" width="${stampW}" height="${stampH}" fill="none" stroke="${INK}" stroke-width="1"/>`;
    const stampTextPath = textPath(`NO.${entryNumber(data.word)}`, 'mono', 8, stampX + stampW / 2, stampY + stampH / 2, 'center', 'middle');

    const wordY = stampY + stampH + 50;
    const wordSize = fitFontSize(data.word, 'serif-italic', halfW - padR * 2, 30, 16);
    const wordPath = textPath(data.word, 'serif-italic', wordSize, halfW + padR, wordY, 'left', 'middle');

    const ipaY = wordY + wordSize / 2 + 18;
    const ipaText = `${data.partOfSpeech ? `${data.partOfSpeech} · ` : ''}${data.ipa ? `/${data.ipa}/` : ''}` || '—';
    const ipaSize = fitFontSize(ipaText, 'mono', halfW - padR * 2, 10, 8);
    const ipaPath = textPath(ipaText, 'mono', ipaSize, halfW + padR, ipaY, 'left', 'middle');

    const ruleY = ipaY + 18;
    const ruleLine = `<line x1="${halfW + padR}" y1="${ruleY}" x2="${width - padR}" y2="${ruleY}" stroke="${RULE}" stroke-width="0.5"/>`;

    const etymY = ruleY + 22;
    const etymText = data.etymology
      ? `from ${data.originLanguage ? `${data.originLanguage}: ` : ''}${truncate(data.etymology, 60)}`
      : truncate(data.definition, 60);
    const etymLines = wrapText(etymText, 26).slice(0, 4);
    const etymPaths = etymLines.map((line, i) => {
      const lineSize = fitFontSize(line, 'serif', halfW - padR * 2, 11, 9);
      const p = textPath(line, 'serif', lineSize, halfW + padR, etymY + i * 16, 'left', 'middle');
      return `<path d="${p}" fill="${INK}"/>`;
    });

    const barcodeY = height - 36;
    const widths = [];
    let h = hash(data.word);
    for (let i = 0; i < 10; i++) {
      h = (h * 1664525 + 1013904223) >>> 0;
      widths.push(1 + (h % 4));
    }
    const barcodeOut: string[] = [];
    let bx = halfW + padR;
    widths.forEach((bw) => {
      barcodeOut.push(`<rect x="${bx}" y="${barcodeY - 6}" width="${bw}" height="14" fill="${META}"/>`);
      bx += bw + 2;
    });
    const watermarkPath = textPath(watermark.replace(/^@/, ''), 'mono', 9, width - padR, barcodeY, 'right', 'middle');

    const divider = `<line x1="${halfW}" y1="0" x2="${halfW}" y2="${height}" stroke="${INK}" stroke-width="2"/>`;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <rect x="0" y="0" width="${halfW}" height="${height}" fill="${LEFT_PAPER}"/>
        <path d="${headerLeftPath}" fill="${META}"/>
        <path d="${headerLeftRightPath}" fill="${META}"/>
        ${notePaths.join('\n')}
        ${divider}
        ${stampRect}
        <path d="${stampTextPath}" fill="${INK}"/>
        <path d="${wordPath}" fill="${INK}"/>
        <path d="${ipaPath}" fill="${META}"/>
        ${ruleLine}
        ${etymPaths.join('\n')}
        ${barcodeOut.join('\n')}
        <path d="${watermarkPath}" fill="${META}"/>
      </svg>
    `;
  },
};
