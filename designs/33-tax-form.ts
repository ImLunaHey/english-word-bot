import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, extractCentury, truncate } from './utils';

const BG = '#e8e6dd';
const FIELD = '#ffffff';
const FIELD_BORDER = '#888888';
const INK = '#1a1a1a';
const NUM = '#c44d3c';
const LABEL = '#555555';
const META = '#888888';
const HEAVY = '#1a1a1a';

interface FieldSpec {
  num: string;
  label: string;
  value: string;
  family: 'sans-bold' | 'mono' | 'serif';
  fontSize: number;
  height: number;
}

export const taxForm: Design = {
  name: 'tax-form',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const padX = 32;
    const innerLeft = padX;
    const innerRight = width - padX;
    const innerW = innerRight - innerLeft;
    const labelGap = 4;

    const headerY = 36;
    const headerLeft = textPath('FORM W-428 · LEXICAL DECLARATION', 'mono', 12, innerLeft, headerY, 'left', 'middle');
    const headerRight = textPath(String(new Date().getFullYear()), 'mono', 11, innerRight, headerY, 'right', 'middle');
    const headerRule = `<line x1="${innerLeft}" y1="${headerY + 14}" x2="${innerRight}" y2="${headerY + 14}" stroke="${HEAVY}" stroke-width="2"/>`;

    let y = headerY + 32;

    const renderField = (
      x: number,
      yPos: number,
      w: number,
      f: FieldSpec,
    ) => {
      const labelLineY = yPos;
      const numPath = textPath(f.num, 'mono', 11, x, labelLineY, 'left', 'middle');
      const labelPath = textPath(f.label, 'mono', 11, x + 22, labelLineY, 'left', 'middle');
      const fieldY = labelLineY + 10;
      const valueSize = fitFontSize(f.value, f.family, w - 16, f.fontSize, 9);
      const valuePath = textPath(f.value, f.family, valueSize, x + 10, fieldY + f.height / 2, 'left', 'middle');
      return [
        `<path d="${numPath}" fill="${NUM}"/>`,
        `<path d="${labelPath}" fill="${LABEL}"/>`,
        `<rect x="${x}" y="${fieldY}" width="${w}" height="${f.height}" fill="${FIELD}" stroke="${FIELD_BORDER}" stroke-width="1"/>`,
        `<path d="${valuePath}" fill="${INK}"/>`,
      ].join('\n');
    };

    const out: string[] = [];

    const wordValue = data.word;
    out.push(renderField(innerLeft, y, innerW, {
      num: '1a',
      label: 'word being declared (line 1a must be completed in full)',
      value: wordValue,
      family: 'sans-bold',
      fontSize: 28,
      height: 50,
    }));
    y += 76;

    const halfW = (innerW - 14) / 2;
    out.push(renderField(innerLeft, y, halfW, {
      num: '2',
      label: 'classification',
      value: data.partOfSpeech || '—',
      family: 'mono',
      fontSize: 14,
      height: 32,
    }));
    out.push(renderField(innerLeft + halfW + 14, y, halfW, {
      num: '3',
      label: 'phonetic',
      value: data.ipa ? `/${data.ipa}/` : '—',
      family: 'mono',
      fontSize: 13,
      height: 32,
    }));
    y += 60;

    const meaning = truncate(data.definition, 80);
    out.push(renderField(innerLeft, y, innerW, {
      num: '4',
      label: 'meaning (line 4 must be completed in full)',
      value: meaning,
      family: 'mono',
      fontSize: 13,
      height: 36,
    }));
    y += 64;

    out.push(renderField(innerLeft, y, halfW, {
      num: '5a',
      label: 'origin language',
      value: (data.originLanguage ?? '—').toLowerCase(),
      family: 'mono',
      fontSize: 13,
      height: 32,
    }));
    out.push(renderField(innerLeft + halfW + 14, y, halfW, {
      num: '5b',
      label: 'year of entry',
      value: extractCentury(data.etymology) ?? '—',
      family: 'mono',
      fontSize: 13,
      height: 32,
    }));
    y += 60;

    const footerY = height - 60;
    const footerRule = `<line x1="${innerLeft}" y1="${footerY}" x2="${innerRight}" y2="${footerY}" stroke="${FIELD_BORDER}" stroke-width="1"/>`;
    const sigLabel = textPath('SIGNATURE:', 'mono', 11, innerLeft, footerY + 22, 'left', 'middle');
    const sigName = textPath('englishwordbot', 'serif-italic', 16, innerLeft + 96, footerY + 22, 'left', 'middle');
    const entryPath = textPath(`# ${entryNumber(data.word)}`, 'mono', 11, innerRight, footerY + 22, 'right', 'middle');
    const watermarkPath = textPath(watermark, 'mono', 10, width / 2, height - 18, 'center', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <path d="${headerLeft}" fill="${INK}"/>
        <path d="${headerRight}" fill="${META}"/>
        ${headerRule}
        ${out.join('\n')}
        ${footerRule}
        <path d="${sigLabel}" fill="${LABEL}"/>
        <path d="${sigName}" fill="${INK}"/>
        <path d="${entryPath}" fill="${LABEL}"/>
        <path d="${watermarkPath}" fill="${META}"/>
      </svg>
    `;
  },
};
