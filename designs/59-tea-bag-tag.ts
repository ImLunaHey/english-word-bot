import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, extractCentury, truncate, wrapText } from './utils';

const BG = '#f0e8d8';
const STRING = '#8a7a5a';
const PAPER = '#fafaf2';
const SHADOW = 'rgba(0,0,0,0.18)';
const INK = '#2a1a0a';
const SOFT = '#4a3a1a';
const META = '#8a7a5a';
const RULE = '#c4b896';

function starPolygon(cx: number, cy: number, outer: number, inner: number, points = 5): string {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    coords.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return coords.join(' ');
}

export const teaBagTag: Design = {
  name: 'tea-bag-tag',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const tagW = Math.round(width * 0.62);
    const tagH = Math.round(tagW / 0.85);
    const tagX = (width - tagW) / 2;
    const tagY = height - tagH - 30;
    const tagCx = tagX + tagW / 2;

    const stringTop = 30;
    const stringBottom = tagY;
    const stringLine = `<line x1="${tagCx}" y1="${stringTop}" x2="${tagCx}" y2="${stringBottom}" stroke="${STRING}" stroke-width="1"/>`;

    const padX = 18;
    const innerLeft = tagX + padX;
    const innerRight = tagX + tagW - padX;
    const innerW = tagW - padX * 2;

    let y = tagY + 22;
    const headerSize = 11;
    const headerText = 'EWB BLEND';
    const headerW = fitFontSize(headerText, 'mono', innerW * 0.6, headerSize, 8);
    const headerPath = textPath(headerText, 'mono', headerW, tagCx, y, 'center', 'middle');
    const starOffset = innerW * 0.15;
    const starLeft = starPolygon(tagCx - starOffset, y, 4, 1.7);
    const starRight = starPolygon(tagCx + starOffset, y, 4, 1.7);
    y += 18;
    const subPath = textPath('— word of the day —', 'serif-italic', 12, tagCx, y, 'center', 'middle');
    y += 16;
    const headerRuleY = y;
    const headerRule = `<line x1="${innerLeft}" y1="${headerRuleY}" x2="${innerRight}" y2="${headerRuleY}" stroke="${RULE}" stroke-width="0.5"/>`;
    y += 30;

    const wordSize = fitFontSize(data.word, 'serif-italic', innerW, 24, 12);
    const wordPath = textPath(data.word, 'serif-italic', wordSize, tagCx, y, 'center', 'middle');
    y += wordSize / 2 + 14;

    const ipaText = `${(data.partOfSpeech || 'word').toLowerCase()}${data.ipa ? ` · /${data.ipa}/` : ''}`;
    const ipaSize = fitFontSize(ipaText, 'mono', innerW, 10, 7);
    const ipaPath = textPath(ipaText, 'mono', ipaSize, tagCx, y, 'center', 'middle');
    y += 24;

    const defLines = wrapText(`"${truncate(data.definition.toLowerCase().replace(/\.$/, ''), 50)}"`, 22).slice(0, 2);
    const defPaths = defLines.map((line, i) => {
      const lineSize = fitFontSize(line, 'serif-italic', innerW, 11, 8);
      const p = textPath(line, 'serif-italic', lineSize, tagCx, y + i * 16, 'center', 'middle');
      return `<path d="${p}" fill="${SOFT}"/>`;
    });
    y += defLines.length * 16 + 14;

    const footerRuleY = tagY + tagH - 28;
    const footerRule = `<line x1="${innerLeft}" y1="${footerRuleY}" x2="${innerRight}" y2="${footerRuleY}" stroke="${RULE}" stroke-width="0.6" stroke-dasharray="3 3"/>`;

    const footerText = `FROM ${(data.originLanguage ?? '—').toUpperCase()} · EST. ${extractCentury(data.etymology) ?? '—'} · #${entryNumber(data.word)}`;
    const footerSize = fitFontSize(footerText, 'mono', innerW, 9, 6);
    const footerPath = textPath(footerText, 'mono', footerSize, tagCx, tagY + tagH - 14, 'center', 'middle');

    const watermarkPath = textPath(watermark, 'mono', 9, width / 2, height - 14, 'center', 'middle');

    void INK;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        ${stringLine}
        <rect x="${tagX + 4}" y="${tagY + 4}" width="${tagW}" height="${tagH}" fill="${SHADOW}"/>
        <rect x="${tagX}" y="${tagY}" width="${tagW}" height="${tagH}" fill="${PAPER}"/>
        <polygon points="${starLeft}" fill="${META}"/>
        <path d="${headerPath}" fill="${META}"/>
        <polygon points="${starRight}" fill="${META}"/>
        <path d="${subPath}" fill="${SOFT}"/>
        ${headerRule}
        <path d="${wordPath}" fill="${SOFT}"/>
        <path d="${ipaPath}" fill="${META}"/>
        ${defPaths.join('\n')}
        ${footerRule}
        <path d="${footerPath}" fill="${META}"/>
        <path d="${watermarkPath}" fill="${META}" fill-opacity="0.4"/>
      </svg>
    `;
  },
};
