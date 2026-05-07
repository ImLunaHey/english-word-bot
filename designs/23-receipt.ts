import type { Design } from './types';
import { textPath, measureText } from './fonts';
import { entryNumber, todayISO, extractCentury, truncate, wrapText } from './utils';

const BACKDROP = '#4a4a4a';
const PAPER = '#fafaf2';
const INK = '#1a1a1a';
const DIM = '#555555';
const RULE = '#999999';

const BARCODE = '||||| || |||| ||| || |||||';

export const receipt: Design = {
  name: 'receipt',
  canRender: () => true,
  render: ({ data, watermark, width, height }) => {
    const receiptW = Math.round(width * 0.78);
    const receiptH = Math.round(height * 0.86);
    const receiptX = (width - receiptW) / 2;
    const receiptY = (height - receiptH) / 2;
    const padX = 28;
    const innerW = receiptW - padX * 2;

    const left = receiptX + padX;
    const right = receiptX + receiptW - padX;
    let y = receiptY + 32;

    const header = textPath('ENGLISHWORDBOT', 'mono', 16, receiptX + receiptW / 2, y, 'center', 'middle');
    y += 18;
    const subheader = textPath('EST. 2024 · BSKY.SOCIAL', 'mono', 10, receiptX + receiptW / 2, y, 'center', 'middle');
    y += 18;

    const ruleSegments: string[] = [];
    const dashed = (yy: number) =>
      `<line x1="${left}" y1="${yy}" x2="${right}" y2="${yy}" stroke="${RULE}" stroke-width="1" stroke-dasharray="6 4"/>`;

    ruleSegments.push(dashed(y));
    y += 16;

    const orderText = `ORDER #${entryNumber(data.word)}`;
    const orderPath = textPath(orderText, 'mono', 11, left, y, 'left', 'middle');
    y += 16;
    const datePath = textPath(`${todayISO()} · 14:20`, 'mono', 11, left, y, 'left', 'middle');
    y += 18;

    ruleSegments.push(dashed(y));
    y += 16;

    const wordLine = `1× ${data.word.toUpperCase()}`;
    const partAbbr = data.partOfSpeech ? `(${data.partOfSpeech.charAt(0).toLowerCase()}.)` : '';
    const wordPath = textPath(wordLine, 'mono', 13, left, y, 'left', 'middle');
    const partPath = partAbbr ? textPath(partAbbr, 'mono', 13, right, y, 'right', 'middle') : '';
    y += 16;

    let ipaPath = '';
    if (data.ipa) {
      ipaPath = textPath(`/${data.ipa}/`, 'mono', 10, left + 14, y, 'left', 'middle');
      y += 14;
    }

    const defLines = data.definition ? wrapText(truncate(data.definition, 100), 32).slice(0, 3) : [];
    const defPaths = defLines.map((line, i) => {
      const p = textPath(line, 'mono', 10, left + 14, y + i * 14, 'left', 'middle');
      return `<path d="${p}" fill="${DIM}"/>`;
    });
    y += defLines.length * 14 + 6;

    ruleSegments.push(dashed(y));
    y += 16;

    const metaRows: Array<[string, string]> = [
      ['LETTERS', String(data.word.length)],
      ['ORIGIN', (data.originLanguage ?? '—').toUpperCase()],
      ['CENTURY', extractCentury(data.etymology) ?? '—'],
    ];
    const metaPaths = metaRows.flatMap(([label, value], i) => {
      const lp = textPath(label, 'mono', 11, left, y + i * 16, 'left', 'middle');
      const vp = textPath(value, 'mono', 11, right, y + i * 16, 'right', 'middle');
      return [`<path d="${lp}" fill="${INK}"/>`, `<path d="${vp}" fill="${INK}"/>`];
    });
    y += metaRows.length * 16 + 6;

    const heavyRule = `<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="${INK}" stroke-width="2"/>`;
    y += 18;

    const thanks = textPath('THANK YOU', 'mono', 11, receiptX + receiptW / 2, y, 'center', 'middle');
    const thanksW = measureText('THANK YOU', 'mono', 11).width;
    const starOffset = thanksW / 2 + 14;
    const starLeft = starPolygon(receiptX + receiptW / 2 - starOffset, y, 5, 2);
    const starRight = starPolygon(receiptX + receiptW / 2 + starOffset, y, 5, 2);
    y += 22;

    const barcodePath = textPath(BARCODE, 'mono', 12, receiptX + receiptW / 2, y, 'center', 'middle');
    y += 22;

    const watermarkPath = textPath(watermark, 'mono', 9, receiptX + receiptW / 2, y, 'center', 'middle');

    const shadow = `<rect x="${receiptX + 6}" y="${receiptY + 6}" width="${receiptW}" height="${receiptH}" fill="rgba(0,0,0,0.25)"/>`;
    const paperRect = `<rect x="${receiptX}" y="${receiptY}" width="${receiptW}" height="${receiptH}" fill="${PAPER}"/>`;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BACKDROP}"/>
        ${shadow}
        ${paperRect}
        <path d="${header}" fill="${INK}"/>
        <path d="${subheader}" fill="${DIM}"/>
        ${ruleSegments.join('\n')}
        <path d="${orderPath}" fill="${DIM}"/>
        <path d="${datePath}" fill="${DIM}"/>
        <path d="${wordPath}" fill="${INK}"/>
        ${partPath ? `<path d="${partPath}" fill="${INK}"/>` : ''}
        ${ipaPath ? `<path d="${ipaPath}" fill="${DIM}"/>` : ''}
        ${defPaths.join('\n')}
        ${metaPaths.join('\n')}
        ${heavyRule}
        <polygon points="${starLeft}" fill="${INK}"/>
        <polygon points="${starRight}" fill="${INK}"/>
        <path d="${thanks}" fill="${INK}"/>
        <path d="${barcodePath}" fill="${INK}"/>
        <path d="${watermarkPath}" fill="${DIM}"/>
        ${innerW ? '' : ''}
      </svg>
    `;
  },
};

function starPolygon(cx: number, cy: number, outer: number, inner: number, points = 5): string {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    coords.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return coords.join(' ');
}
