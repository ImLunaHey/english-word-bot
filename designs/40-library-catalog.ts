import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { capitalize, entryNumber, extractCentury, posAbbrev, truncate, wrapText } from './utils';

const BACKDROP = '#2a2218';
const CARD = '#f4ead0';
const INK = '#2a1a0a';
const META = '#5a3a1a';
const SOFT = '#4a2a1a';
const RULE = '#8a6a3a';
const HOLE = '#2a2218';

export const libraryCatalog: Design = {
  name: 'library-catalog',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const margin = 60;
    const cardX = margin;
    const cardY = margin + 20;
    const cardW = width - margin * 2;
    const cardH = height - margin * 2 - 40;
    const padX = 30;
    const innerLeft = cardX + padX;
    const innerRight = cardX + cardW - padX;
    const innerW = innerRight - innerLeft;

    const holeRadius = 8;
    const sideHole = `<circle cx="${cardX}" cy="${cardY + cardH / 2}" r="${holeRadius}" fill="${HOLE}"/>`;
    const bottomHole = `<circle cx="${cardX + cardW / 2}" cy="${cardY + cardH - 6}" r="${holeRadius * 0.6}" fill="${HOLE}"/>`;

    let y = cardY + 30;
    const deweyText = `DEWEY 423.${(data.word.length * 7) % 100}`;
    const deweyPath = textPath(deweyText, 'mono', 11, innerLeft, y, 'left', 'middle');
    const cardPath = textPath(`CARD ${entryNumber(data.word)}`, 'mono', 11, innerRight, y, 'right', 'middle');
    y += 14;
    const ruleA = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${RULE}" stroke-width="1"/>`;
    y += 30;

    const titleText = `${capitalize(data.word)}, ${data.partOfSpeech ? posAbbrev(data.partOfSpeech) : 'n.'}`;
    const titleSize = fitFontSize(titleText, 'serif', innerW, 30, 16);
    const titlePath = textPath(titleText, 'serif', titleSize, innerLeft, y, 'left', 'middle');
    y += titleSize / 2 + 14;

    let ipaPath = '';
    if (data.ipa) {
      ipaPath = textPath(`/${data.ipa}/`, 'mono', 11, innerLeft, y, 'left', 'middle');
      y += 22;
    } else {
      y += 6;
    }

    const ruleB = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${RULE}" stroke-width="1"/>`;
    y += 22;

    const defLines = wrapText(data.definition, 50).slice(0, 2);
    const defPaths = defLines.map((line) => {
      const size = fitFontSize(line, 'serif', innerW, 14, 11);
      const p = textPath(line, 'serif', size, innerLeft, y, 'left', 'middle');
      y += 22;
      return `<path d="${p}" fill="${INK}"/>`;
    });

    let etymPaths: string[] = [];
    if (data.etymology) {
      const etymText = `— ${truncate(data.etymology.replace(/^From\s+/i, 'from '), 70)}${extractCentury(data.etymology) ? ` (${extractCentury(data.etymology)}).` : ''}`;
      const etymLines = wrapText(etymText, 56).slice(0, 2);
      etymPaths = etymLines.map((line) => {
        const size = fitFontSize(line, 'serif-italic', innerW, 12, 10);
        const p = textPath(line, 'serif-italic', size, innerLeft, y, 'left', 'middle');
        y += 20;
        return `<path d="${p}" fill="${SOFT}"/>`;
      });
    }
    y += 8;

    const ruleC = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${RULE}" stroke-width="1"/>`;
    y += 22;

    const seeAlsoTokens = data.definition
      .toLowerCase()
      .match(/\b[a-z]{5,}\b/g)
      ?.slice(0, 3)
      .join(' · ') ?? '—';
    const seeAlsoLabel = textPath('SEE ALSO', 'mono', 10, innerLeft, y, 'left', 'middle');
    const seeAlsoSize = fitFontSize(seeAlsoTokens, 'mono', innerW - 100, 11, 8);
    const seeAlsoValue = textPath(seeAlsoTokens, 'mono', seeAlsoSize, innerLeft + 100, y, 'left', 'middle');
    y += 20;

    const crossRefValue = data.partOfSpeech ? `${data.partOfSpeech.toLowerCase()}, types of` : '—';
    const crossRefLabel = textPath('CROSS-REF', 'mono', 10, innerLeft, y, 'left', 'middle');
    const crossRefSize = fitFontSize(crossRefValue, 'mono', innerW - 100, 11, 8);
    const crossRefPath = textPath(crossRefValue, 'mono', crossRefSize, innerLeft + 100, y, 'left', 'middle');
    y += 28;

    const ruleD = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${RULE}" stroke-width="1"/>`;
    y += 22;

    const watermarkText = `— ${watermark.toUpperCase()} —`;
    const watermarkSize = fitFontSize(watermarkText, 'mono', innerW, 11, 8);
    const watermarkPath = textPath(watermarkText, 'mono', watermarkSize, cardX + cardW / 2, y, 'center', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BACKDROP}"/>
        <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" fill="${CARD}"/>
        ${sideHole}
        ${bottomHole}
        <path d="${deweyPath}" fill="${META}"/>
        <path d="${cardPath}" fill="${META}"/>
        ${ruleA}
        <path d="${titlePath}" fill="${INK}"/>
        ${ipaPath ? `<path d="${ipaPath}" fill="${META}"/>` : ''}
        ${ruleB}
        ${defPaths.join('\n')}
        ${etymPaths.join('\n')}
        ${ruleC}
        <path d="${seeAlsoLabel}" fill="${META}"/>
        <path d="${seeAlsoValue}" fill="${INK}"/>
        <path d="${crossRefLabel}" fill="${META}"/>
        <path d="${crossRefPath}" fill="${INK}"/>
        ${ruleD}
        <path d="${watermarkPath}" fill="${META}"/>
      </svg>
    `;
  },
};
