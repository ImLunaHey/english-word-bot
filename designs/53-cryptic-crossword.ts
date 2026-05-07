import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { capitalize, entryNumber, extractCentury, truncate, wrapText } from './utils';
import { splitMorphemesDetailed } from './morphemes';

const PAPER = '#f0eadc';
const INK = '#1a1a1a';
const SOFT = '#555555';
const RED = '#c44d3c';
const TILE_BG = '#1a1a1a';
const TILE_TEXT = '#ffffff';

function buildCrypticClue(data: { word: string; definition: string }): string {
  const segments = splitMorphemesDetailed(data.word);
  if (segments.length >= 2) {
    const firstHint = segments[0].gloss ?? 'an element';
    return `"${capitalize(firstHint)} an arrangement, ${truncate(data.definition.toLowerCase().replace(/\.$/, ''), 50)}. (${data.word.length})"`;
  }
  return `"A word for ${truncate(data.definition.toLowerCase().replace(/\.$/, ''), 60)}. (${data.word.length})"`;
}

export const crypticCrossword: Design = {
  name: 'cryptic-crossword',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const padX = 26;
    const innerLeft = padX;
    const innerRight = width - padX;
    const innerW = innerRight - innerLeft;

    const headerY = 38;
    const titleSize = fitFontSize('The Lexical Times', 'serif-italic', innerW * 0.7, 26, 16);
    const titlePath = textPath('The Lexical Times', 'serif-italic', titleSize, innerLeft, headerY, 'left', 'middle');
    const idPath = textPath(`CRYPTIC NO.${entryNumber(data.word)}`, 'mono', 10, innerRight, headerY, 'right', 'middle');
    const headerRule1Y = headerY + 22;
    const headerRule1 = `<line x1="0" y1="${headerRule1Y}" x2="${width}" y2="${headerRule1Y}" stroke="${INK}" stroke-width="2"/>`;
    const headerRule2 = `<line x1="0" y1="${headerRule1Y + 5}" x2="${width}" y2="${headerRule1Y + 5}" stroke="${INK}" stroke-width="1"/>`;

    let y = headerRule1Y + 36;

    const clueLabelPath = textPath('CLUE OF THE DAY', 'mono', 10, innerLeft, y, 'left', 'middle');
    y += 24;

    const clueText = buildCrypticClue(data);
    const clueLines = wrapText(clueText, 56).slice(0, 3);
    const cluePaths = clueLines.map((line) => {
      const lineSize = fitFontSize(line, 'serif-italic', innerW, 14, 10);
      const p = textPath(line, 'serif-italic', lineSize, innerLeft, y, 'left', 'middle');
      y += 22;
      return `<path d="${p}" fill="${INK}"/>`;
    });
    y += 12;

    const cols = Math.min(data.word.length, 12);
    const rows = Math.ceil(data.word.length / cols);
    const gridX = innerLeft;
    const gridW = innerW;
    const gap = 1;
    const cellSize = (gridW - gap * (cols - 1)) / cols;
    const gridY = y;
    const tileOut: string[] = [];
    const letters = data.word.toUpperCase().split('');
    letters.forEach((ch, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const cx = gridX + c * (cellSize + gap);
      const cy = gridY + r * (cellSize + gap);
      tileOut.push(`<rect x="${cx}" y="${cy}" width="${cellSize}" height="${cellSize}" fill="${TILE_BG}"/>`);
      const charPath = textPath(ch, 'mono', cellSize * 0.55, cx + cellSize / 2, cy + cellSize / 2, 'center', 'middle');
      tileOut.push(`<path d="${charPath}" fill="${TILE_TEXT}"/>`);
    });
    const gridH = rows * cellSize + (rows - 1) * gap;
    const gridFrame = `<rect x="${gridX - 6}" y="${gridY - 6}" width="${gridW + 12}" height="${gridH + 12}" fill="none" stroke="${INK}" stroke-width="2"/>`;
    y = gridY + gridH + 22;

    const wordSize = fitFontSize(`${data.word.toUpperCase()}  /${data.ipa ?? '—'}/`, 'serif', innerW, 14, 10);
    const wordHeader = `${data.word.toUpperCase()}  ${data.ipa ? `/${data.ipa}/` : ''}, ${data.partOfSpeech ? `${data.partOfSpeech.charAt(0).toLowerCase()}.` : 'n.'}`;
    const wordHeaderPath = textPath(wordHeader, 'serif', wordSize, innerLeft, y, 'left', 'middle');
    y += 22;

    const expandedText = `${data.definition}${data.etymology ? ` ${truncate(data.etymology, 80)}` : ''}${extractCentury(data.etymology) ? ` (${extractCentury(data.etymology)})` : ''}.`;
    const expandedLines = wrapText(expandedText, 56).slice(0, 3);
    const expandedPaths = expandedLines.map((line) => {
      const lineSize = fitFontSize(line, 'serif', innerW, 12, 10);
      const p = textPath(line, 'serif', lineSize, innerLeft, y, 'left', 'middle');
      y += 18;
      return `<path d="${p}" fill="${INK}"/>`;
    });

    const footerY = height - 22;
    const footerRuleY = footerY - 14;
    const footerRule = `<line x1="${innerLeft}" y1="${footerRuleY}" x2="${innerRight}" y2="${footerRuleY}" stroke="${INK}" stroke-width="1"/>`;
    const footerLeft = textPath('SOLVED', 'mono', 9, innerLeft, footerY, 'left', 'middle');
    const footerRight = textPath(watermark.replace(/^@/, ''), 'mono', 9, innerRight, footerY, 'right', 'middle');

    void RED;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${PAPER}"/>
        <path d="${titlePath}" fill="${INK}"/>
        <path d="${idPath}" fill="${SOFT}"/>
        ${headerRule1}
        ${headerRule2}
        <path d="${clueLabelPath}" fill="${RED}"/>
        ${cluePaths.join('\n')}
        ${gridFrame}
        ${tileOut.join('\n')}
        <path d="${wordHeaderPath}" fill="${INK}"/>
        ${expandedPaths.join('\n')}
        ${footerRule}
        <path d="${footerLeft}" fill="${SOFT}"/>
        <path d="${footerRight}" fill="${SOFT}"/>
      </svg>
    `;
  },
};
