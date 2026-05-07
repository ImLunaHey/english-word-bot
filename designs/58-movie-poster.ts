import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, extractCentury, hash, rarityStars, starGlyphs, truncate } from './utils';

const BG = '#1a1428';
const TEXT = '#f4ead0';
const ACCENT = '#d4a574';
const SOFT = '#c8baa0';
const DIM = '#5a4a3a';

const TAGLINES = [
  '"in a world of broken promises…\none word still binds them."',
  '"some words deserve their own legend."',
  '"this season — vocabulary changes everything."',
  '"they thought it was forgotten.\nthey were wrong."',
  '"one word. four syllables. infinite meaning."',
  '"history wrote it. you live it."',
];

function rarityDescriptor(stars: number): string {
  if (stars >= 4) return 'ARCHAIC';
  if (stars === 3) return 'UNCOMMON';
  return 'COMMON';
}

export const moviePoster: Design = {
  name: 'movie-poster',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const padX = 28;
    const innerLeft = padX;
    const innerRight = width - padX;
    const innerW = innerRight - innerLeft;

    let y = 36;
    const presentsPath = textPath('EWB STUDIOS PRESENTS', 'mono', 11, width / 2, y, 'center', 'middle');
    y += 22;
    const subTitleText = `a ${(data.partOfSpeech || 'word').toLowerCase()}, of ${(data.originLanguage ?? 'unknown').toLowerCase()} origin`;
    const subTitleSize = fitFontSize(subTitleText, 'mono', innerW, 12, 9);
    const subTitlePath = textPath(subTitleText, 'mono', subTitleSize, width / 2, y, 'center', 'middle');
    y += 22;

    const ruleTopY = y;
    const ruleTop = `<line x1="${innerLeft}" y1="${ruleTopY}" x2="${innerRight}" y2="${ruleTopY}" stroke="${DIM}" stroke-width="0.5"/>`;
    y += 60;

    const wordSize = fitFontSize(data.word, 'serif-italic', innerW, 56, 22);
    const wordPath = textPath(data.word, 'serif-italic', wordSize, width / 2, y, 'center', 'middle');
    y += wordSize / 2 + 26;

    const taglineRaw = TAGLINES[hash(data.word) % TAGLINES.length];
    const taglineLines = taglineRaw.split('\n');
    const taglinePaths = taglineLines.map((line, i) => {
      const lineSize = fitFontSize(line, 'serif-italic', innerW * 0.85, 14, 10);
      const p = textPath(line, 'serif-italic', lineSize, width / 2, y + i * 22, 'center', 'middle');
      return `<path d="${p}" fill="${TEXT}"/>`;
    });
    y += taglineLines.length * 22 + 8;

    if (data.ipa) {
      const ipaSize = fitFontSize(`/${data.ipa}/`, 'mono', innerW * 0.7, 12, 9);
      const ipaPath = textPath(`/${data.ipa}/`, 'mono', ipaSize, width / 2, y, 'center', 'middle');
      taglinePaths.push(`<path d="${ipaPath}" fill="${ACCENT}"/>`);
      y += 26;
    }

    const ruleBotY = y + 4;
    const ruleBot = `<line x1="${innerLeft}" y1="${ruleBotY}" x2="${innerRight}" y2="${ruleBotY}" stroke="${DIM}" stroke-width="0.5"/>`;
    y = ruleBotY + 26;

    const colW = innerW / 2;
    const stars = rarityStars(data.word);
    const credits: Array<[string, string]> = [
      ['DEFINITION', truncate(data.definition.toUpperCase().replace(/\.$/, ''), 28)],
      ['ORIGIN', `${(data.originLanguage ?? 'UNKNOWN').toUpperCase()}, ${extractCentury(data.etymology) ?? '—'}`],
      ['RATING', `${starGlyphs(stars)} ${rarityDescriptor(stars)}`],
      ['RUNTIME', `${data.word.length} LETTERS`],
    ];
    const creditPaths: string[] = [];
    credits.forEach((row, i) => {
      const r = Math.floor(i / 2);
      const c = i % 2;
      const x = innerLeft + c * colW;
      const cy = y + r * 36;
      const lp = textPath(row[0], 'mono', 9, x, cy, 'left', 'middle');
      const valSize = fitFontSize(row[1], 'mono', colW - 12, 10, 8);
      const vp = textPath(row[1], 'mono', valSize, x, cy + 14, 'left', 'middle');
      creditPaths.push(`<path d="${lp}" fill="${DIM}"/>`);
      creditPaths.push(`<path d="${vp}" fill="${SOFT}"/>`);
    });
    y += 80;

    const footerY = height - 28;
    const footerRule = `<line x1="${innerLeft}" y1="${footerY - 14}" x2="${innerRight}" y2="${footerY - 14}" stroke="${DIM}" stroke-width="0.5"/>`;
    const footerText = `— IN VOCABULARIES EVERYWHERE · #${entryNumber(data.word)} —`;
    const footerSize = fitFontSize(footerText, 'mono', innerW, 10, 8);
    const footerPath = textPath(footerText, 'mono', footerSize, width / 2, footerY, 'center', 'middle');

    const watermarkPath = textPath(watermark, 'mono', 9, width / 2, height - 12, 'center', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <path d="${presentsPath}" fill="${ACCENT}"/>
        <path d="${subTitlePath}" fill="${SOFT}"/>
        ${ruleTop}
        <path d="${wordPath}" fill="${ACCENT}"/>
        ${taglinePaths.join('\n')}
        ${ruleBot}
        ${creditPaths.join('\n')}
        ${footerRule}
        <path d="${footerPath}" fill="${ACCENT}"/>
        <path d="${watermarkPath}" fill="${DIM}"/>
      </svg>
    `;
  },
};
