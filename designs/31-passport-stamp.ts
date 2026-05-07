import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, extractCentury, truncate } from './utils';

const BG = '#d8cfb8';
const PANEL = '#e8dec5';
const BORDER = '#8a7a5a';
const LABEL = '#8a7a5a';
const HEAD = '#2a1a0a';
const META = '#5a4a2a';
const STAMP = '#c44d3c';

export const passportStamp: Design = {
  name: 'passport-stamp',
  canRender: () => true,
  render: ({ data, watermark, width, height }) => {
    const margin = 60;
    const panelX = margin;
    const panelY = margin + 60;
    const panelW = width - margin * 2;
    const panelH = height - margin * 2 - 100;
    const padX = 28;
    const innerLeft = panelX + padX;
    const innerRight = panelX + panelW - padX;

    const headerY = panelY + 28;
    const headerLeft = textPath('DEPT. OF LEXICOGRAPHY', 'mono', 11, innerLeft, headerY, 'left', 'middle');
    const headerRight = textPath(`NO. ${entryNumber(data.word)}`, 'mono', 11, innerRight, headerY, 'right', 'middle');

    const dashRule = (y: number) =>
      `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${BORDER}" stroke-width="1" stroke-dasharray="6 4"/>`;

    const headerRuleY = headerY + 18;

    const surnameLabelY = headerRuleY + 32;
    const surnameLabelPath = textPath('SURNAME / NOM', 'mono', 11, innerLeft, surnameLabelY, 'left', 'middle');

    const wordY = surnameLabelY + 38;
    const wordSize = fitFontSize(data.word.toUpperCase(), 'mono', panelW - padX * 2 - 20, 32, 16);
    const wordPath = textPath(data.word.toUpperCase(), 'mono', wordSize, innerLeft, wordY, 'left', 'middle');

    const subY = wordY + wordSize / 2 + 22;
    const subText = `CLASS · ${(data.partOfSpeech || 'WORD').toUpperCase()}${data.ipa ? `   /   PHON · /${data.ipa}/` : ''}`;
    const subSize = fitFontSize(subText, 'mono', panelW - padX * 2, 12, 9);
    const subPath = textPath(subText, 'mono', subSize, innerLeft, subY, 'left', 'middle');

    const gridRuleY = subY + 22;
    const gridStartY = gridRuleY + 26;
    const labelW = 130;
    const valueX = innerLeft + labelW;
    const rowH = 22;

    const meaning = data.definition ? truncate(data.definition, 38).toUpperCase() : '—';
    const rows: Array<[string, string]> = [
      ['NATIONALITY', (data.originLanguage ?? '—').toUpperCase()],
      ['DATE OF ENTRY', extractCentury(data.etymology) ?? '—'],
      ['MEANING', meaning],
    ];
    const rowPaths = rows.flatMap(([label, value], i) => {
      const y = gridStartY + i * rowH;
      const lp = textPath(label, 'mono', 11, innerLeft, y, 'left', 'middle');
      const valueSize = fitFontSize(value, 'mono', innerRight - valueX, 11, 8);
      const vp = textPath(value, 'mono', valueSize, valueX, y, 'left', 'middle');
      return [
        `<path d="${lp}" fill="${LABEL}"/>`,
        `<path d="${vp}" fill="${HEAD}"/>`,
      ];
    });

    const stampCx = panelX + panelW - 60;
    const stampCy = panelY + panelH * 0.55;
    const stampW = 130;
    const stampH = 36;
    const stampRect = `<rect x="${-stampW / 2}" y="${-stampH / 2}" width="${stampW}" height="${stampH}" fill="none" stroke="${STAMP}" stroke-width="2.5" stroke-opacity="0.85"/>`;
    const innerStamp = `<rect x="${-stampW / 2 + 4}" y="${-stampH / 2 + 4}" width="${stampW - 8}" height="${stampH - 8}" fill="none" stroke="${STAMP}" stroke-width="0.8" stroke-opacity="0.6"/>`;
    const stampTextPath = textPath('APPROVED', 'mono', 14, 0, 0, 'center', 'middle');
    const stamp = `<g transform="translate(${stampCx} ${stampCy}) rotate(-12)">${stampRect}${innerStamp}<path d="${stampTextPath}" fill="${STAMP}" fill-opacity="0.85"/></g>`;

    const watermarkPath = textPath(watermark.toUpperCase(), 'mono', 11, width / 2, height - margin / 2 - 16, 'center', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" fill="${PANEL}" stroke="${BORDER}" stroke-width="1"/>
        <path d="${headerLeft}" fill="${META}"/>
        <path d="${headerRight}" fill="${META}"/>
        ${dashRule(headerRuleY)}
        <path d="${surnameLabelPath}" fill="${LABEL}"/>
        <path d="${wordPath}" fill="${HEAD}"/>
        <path d="${subPath}" fill="${META}"/>
        ${dashRule(gridRuleY)}
        ${rowPaths.join('\n')}
        ${stamp}
        <path d="${watermarkPath}" fill="${META}"/>
      </svg>
    `;
  },
};
