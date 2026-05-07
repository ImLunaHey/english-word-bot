import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, extractCentury, rarityStars, starGlyphs, truncate, wrapText } from './utils';
import { splitMorphemesDetailed } from './morphemes';

const PAPER = '#fef0e0';
const INK = '#4a2a1a';
const RED = '#c44d3c';
const HEADER_TEXT = '#fef0e0';
const META = '#8a4a2a';
const ACCENT = '#8a4a2a';
const RULE = '#c4a474';
const FOOTER_BG = 'rgba(196,77,60,0.15)';

export const recipeCard: Design = {
  name: 'recipe-card',
  canRender: () => true,
  render: ({ data, watermark, width, height }) => {
    const padX = 28;
    const innerLeft = padX;
    const innerRight = width - padX;
    const innerW = innerRight - innerLeft;

    const headerH = 86;
    const headerNumPath = textPath(`— RECIPE NO.${entryNumber(data.word)} —`, 'mono', 10, width / 2, 26, 'center', 'middle');
    const headerWordSize = fitFontSize(data.word, 'serif-italic', width - 60, 30, 18);
    const headerWordPath = textPath(data.word, 'serif-italic', headerWordSize, width / 2, 56, 'center', 'middle');

    let y = headerH + 30;

    const firstNoun = data.definition?.match(/\b[a-z]{5,}\b/i)?.[0] ?? 'word';
    const century = extractCentury(data.etymology);
    const starText = starGlyphs(rarityStars(data.word));

    const stat3X = [innerLeft + innerW / 6, innerLeft + innerW / 2, innerLeft + (innerW * 5) / 6];
    const statLabel: Array<[string, string]> = [
      ['SERVES', `1 ${firstNoun.toUpperCase()}`],
      ['PREP', century ? `${century} CENT.` : 'AN ERA'],
      ['DIFFICULTY', starText],
    ];
    const statPaths: string[] = [];
    statLabel.forEach(([lbl, val], i) => {
      const lblPath = textPath(lbl, 'mono', 10, stat3X[i], y, 'center', 'middle');
      statPaths.push(`<path d="${lblPath}" fill="${ACCENT}"/>`);
      const valSize = fitFontSize(val, 'sans-bold', innerW / 3 - 10, 13, 9);
      const valPath = textPath(val, 'sans-bold', valSize, stat3X[i], y + 18, 'center', 'middle');
      statPaths.push(`<path d="${valPath}" fill="${INK}"/>`);
    });
    y += 50;

    const ruleA = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${RULE}" stroke-width="1" stroke-dasharray="4 4"/>`;
    y += 24;

    const ingredientsLabel = textPath('INGREDIENTS', 'mono', 10, innerLeft, y, 'left', 'middle');
    y += 24;

    const morphemes = splitMorphemesDetailed(data.word);
    const ingPaths: string[] = [];
    if (morphemes.length === 1) {
      const ip = textPath('· 1 word — to taste', 'serif', 13, innerLeft, y, 'left', 'middle');
      ingPaths.push(`<path d="${ip}" fill="${INK}"/>`);
      y += 22;
    } else {
      morphemes.forEach((m) => {
        const text = `· 1 ${m.kind} "${m.segment}"${m.gloss ? ` (${m.gloss})` : ''}`;
        const size = fitFontSize(text, 'serif', innerW - 4, 13, 10);
        const p = textPath(text, 'serif', size, innerLeft, y, 'left', 'middle');
        ingPaths.push(`<path d="${p}" fill="${INK}"/>`);
        y += 22;
      });
    }
    if (data.originLanguage) {
      const pinch = `· a pinch of ${data.originLanguage}${century ? ` (${century} reserve)` : ''}`;
      const size = fitFontSize(pinch, 'serif-italic', innerW - 4, 12, 10);
      const p = textPath(pinch, 'serif-italic', size, innerLeft, y, 'left', 'middle');
      ingPaths.push(`<path d="${p}" fill="${ACCENT}"/>`);
      y += 22;
    }
    y += 8;

    const methodLabel = textPath('METHOD', 'mono', 10, innerLeft, y, 'left', 'middle');
    y += 22;
    const methodText = `Combine all parts. Pronounce as /${data.ipa ?? '—'}/. Serves as ${truncate((data.definition ?? 'a fine word').toLowerCase(), 50).replace(/\.$/, '')}.`;
    const methodLines = wrapText(methodText, 56).slice(0, 3);
    const methodPaths = methodLines.map((line) => {
      const lineSize = fitFontSize(line, 'serif', innerW, 13, 10);
      const p = textPath(line, 'serif', lineSize, innerLeft, y, 'left', 'middle');
      y += 20;
      return `<path d="${p}" fill="${INK}"/>`;
    });

    const footerH = 32;
    const footerY = height - footerH / 2;
    const footerPath = textPath(`— FROM THE ${watermark.toUpperCase().replace(/^@/, '')} KITCHEN —`, 'mono', 10, width / 2, footerY, 'center', 'middle');

    void FOOTER_BG; void META;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${PAPER}"/>
        <rect x="0" y="0" width="${width}" height="${headerH}" fill="${RED}"/>
        <path d="${headerNumPath}" fill="${HEADER_TEXT}" fill-opacity="0.85"/>
        <path d="${headerWordPath}" fill="${HEADER_TEXT}"/>
        ${statPaths.join('\n')}
        ${ruleA}
        <path d="${ingredientsLabel}" fill="${ACCENT}"/>
        ${ingPaths.join('\n')}
        <path d="${methodLabel}" fill="${ACCENT}"/>
        ${methodPaths.join('\n')}
        <rect x="0" y="${height - footerH}" width="${width}" height="${footerH}" fill="${RED}" fill-opacity="0.15"/>
        <path d="${footerPath}" fill="${ACCENT}"/>
      </svg>
    `;
  },
};
