import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, extractCentury, truncate } from './utils';

const BG = '#4a3a2a';
const STAMP_BG = '#c44d3c';
const STAMP_TEXT = '#f4ead0';
const DARK_INK = '#1a0a0a';

export const postageStamp: Design = {
  name: 'postage-stamp',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const stampW = Math.round(width * 0.74);
    const stampH = Math.round(stampW / 0.8);
    const stampX = (width - stampW) / 2;
    const stampY = (height - stampH) / 2;

    const punchRadius = 7;
    const punchSpacing = 22;
    const punches: string[] = [];
    for (let x = stampX; x <= stampX + stampW; x += punchSpacing) {
      punches.push(`<circle cx="${x}" cy="${stampY}" r="${punchRadius}" fill="${BG}"/>`);
      punches.push(`<circle cx="${x}" cy="${stampY + stampH}" r="${punchRadius}" fill="${BG}"/>`);
    }
    for (let y = stampY; y <= stampY + stampH; y += punchSpacing) {
      punches.push(`<circle cx="${stampX}" cy="${y}" r="${punchRadius}" fill="${BG}"/>`);
      punches.push(`<circle cx="${stampX + stampW}" cy="${y}" r="${punchRadius}" fill="${BG}"/>`);
    }

    const innerInset = 14;
    const innerX = stampX + innerInset;
    const innerY = stampY + innerInset;
    const innerW = stampW - innerInset * 2;
    const innerH = stampH - innerInset * 2;

    let y = innerY + 22;
    const headerPath = textPath('— ENGLISH LANGUAGE —', 'mono', 10, innerX + innerW / 2, y, 'center', 'middle');
    y += 38;

    const wordSize = fitFontSize(data.word, 'serif-italic', innerW - 16, 30, 13);
    const wordPath = textPath(data.word, 'serif-italic', wordSize, innerX + innerW / 2, y, 'center', 'middle');
    y += wordSize / 2 + 18;

    const ruleW = innerW * 0.55;
    const ruleLine = `<line x1="${innerX + innerW / 2 - ruleW / 2}" y1="${y}" x2="${innerX + innerW / 2 + ruleW / 2}" y2="${y}" stroke="${STAMP_TEXT}" stroke-width="1"/>`;
    y += 18;

    const metaText = `${(data.partOfSpeech || 'word').toLowerCase()} · ${extractCentury(data.etymology) ?? '—'} · ${(data.originLanguage ?? '—').toUpperCase()}`;
    const metaSize = fitFontSize(metaText, 'mono', innerW - 16, 10, 8);
    const metaPath = textPath(metaText, 'mono', metaSize, innerX + innerW / 2, y, 'center', 'middle');
    y += 22;

    const defText = `"${truncate(data.definition, 50)}"`;
    const defSize = fitFontSize(defText, 'serif-italic', innerW - 16, 11, 9);
    const defPath = textPath(defText, 'serif-italic', defSize, innerX + innerW / 2, y, 'center', 'middle');

    const bottomY = innerY + innerH - 24;
    const denomPath = textPath(entryNumber(data.word), 'mono', 18, innerX + 8, bottomY, 'left', 'middle');
    const ewbPath = textPath('EWB', 'mono', 18, innerX + innerW - 8, bottomY, 'right', 'middle');

    const watermarkY = stampY + stampH + 26;
    const watermarkPath = textPath(watermark, 'mono', 10, width / 2, watermarkY, 'center', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <rect x="${stampX}" y="${stampY}" width="${stampW}" height="${stampH}" fill="${STAMP_BG}"/>
        ${punches.join('\n')}
        <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" fill="none" stroke="${STAMP_TEXT}" stroke-width="1"/>
        <path d="${headerPath}" fill="${STAMP_TEXT}"/>
        <path d="${wordPath}" fill="${DARK_INK}"/>
        ${ruleLine}
        <path d="${metaPath}" fill="${STAMP_TEXT}"/>
        <path d="${defPath}" fill="${STAMP_TEXT}" fill-opacity="0.85"/>
        <path d="${denomPath}" fill="${STAMP_TEXT}"/>
        <path d="${ewbPath}" fill="${STAMP_TEXT}"/>
        <path d="${watermarkPath}" fill="${STAMP_TEXT}" fill-opacity="0.7"/>
      </svg>
    `;
  },
};
