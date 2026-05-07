import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, extractCentury, truncate, wrapText } from './utils';
import { splitMorphemes } from './morphemes';

const PAPER = '#f4f0e0';
const INK = '#1a1a1a';
const SOFT = '#555555';
const META = '#888888';
const RULE_HEAVY = '#1a1a1a';
const RULE = '#888888';
const BOX_BG = '#ffffff';

export const patentFiling: Design = {
  name: 'patent-filing',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const padX = 28;
    const innerLeft = padX;
    const innerRight = width - padX;
    const innerW = innerRight - innerLeft;

    let y = 30;
    const officeText = 'UNITED LEXICON OFFICE';
    const officePath = textPath(officeText, 'mono', 11, width / 2, y, 'center', 'middle');
    y += 22;
    const lettersPath = textPath('Letters Patent', 'serif-italic', 18, width / 2, y, 'center', 'middle');
    y += 22;
    const patentText = `PATENT NO.${entryNumber(data.word)} · GRANTED ${extractCentury(data.etymology) ?? '—'}`;
    const patentSize = fitFontSize(patentText, 'mono', innerW, 11, 8);
    const patentPath = textPath(patentText, 'mono', patentSize, width / 2, y, 'center', 'middle');
    y += 14;
    const headerRule = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${RULE_HEAVY}" stroke-width="2"/>`;
    y += 22;

    const colGap = 16;
    const leftW = (innerW - colGap) * 0.4;
    const rightX = innerLeft + leftW + colGap;
    const rightW = innerW - leftW - colGap;

    const boxX = innerLeft;
    const boxY = y;
    const boxH = 220;
    const boxRect = `<rect x="${boxX}" y="${boxY}" width="${leftW}" height="${boxH}" fill="${BOX_BG}" stroke="${META}" stroke-width="1"/>`;
    const figLabelPath = textPath('FIG. 1', 'mono', 9, boxX + leftW / 2, boxY + 18, 'center', 'middle');
    const dashLabelPath = textPath('— DIAGRAM —', 'mono', 9, boxX + leftW / 2, boxY + boxH - 16, 'center', 'middle');

    const { segments } = splitMorphemes(data.word);
    const morphemeLines = segments.length > 1 ? segments.map((s, i) => i < segments.length - 1 ? `${s}-` : s) : splitWordSyllables(data.word).map((s, i, arr) => i < arr.length - 1 ? `${s}-` : s);
    const lineH = 32;
    const longestMorpheme = morphemeLines.reduce((a, b) => a.length > b.length ? a : b);
    const morphemeSize = fitFontSize(longestMorpheme, 'serif-italic', leftW - 20, 26, 14);
    const morphemeStartY = boxY + boxH / 2 - (morphemeLines.length - 1) * lineH / 2;
    const morphemePaths = morphemeLines.map((line, i) => {
      const p = textPath(line, 'serif-italic', morphemeSize, boxX + leftW / 2, morphemeStartY + i * lineH, 'center', 'middle');
      return `<path d="${p}" fill="${INK}"/>`;
    });

    let ry = boxY + 12;
    const titleLabel = textPath('TITLE OF INVENTION', 'mono', 9, rightX, ry, 'left', 'middle');
    ry += 24;
    const titleSize = fitFontSize(data.word, 'serif-italic', rightW, 22, 14);
    const titlePath = textPath(data.word, 'serif-italic', titleSize, rightX, ry, 'left', 'middle');
    ry += titleSize / 2 + 14;
    const subText = `${data.partOfSpeech || '—'}${data.ipa ? ` · /${data.ipa}/` : ''}`;
    const subSize = fitFontSize(subText, 'mono', rightW, 11, 8);
    const subPath = textPath(subText, 'mono', subSize, rightX, ry, 'left', 'middle');
    ry += 28;

    const claimsLabel = textPath('CLAIMS', 'mono', 9, rightX, ry, 'left', 'middle');
    ry += 22;

    const firstNoun = data.definition?.match(/\b[a-z]{4,}\b/i)?.[0] ?? 'word';
    const claimText = `1. A method of ${firstNoun}, comprising:`;
    const claimLines = wrapText(claimText, 30).slice(0, 2);
    const claimPaths = claimLines.map((line) => {
      const lineSize = fitFontSize(line, 'serif', rightW, 12, 10);
      const p = textPath(line, 'serif', lineSize, rightX, ry, 'left', 'middle');
      ry += 18;
      return `<path d="${p}" fill="${INK}"/>`;
    });

    const subParts = data.definition.replace(/\.$/, '').split(/\s+(?:or|and)\s+/).map(s => s.trim()).filter(Boolean);
    const subA = subParts[0] ? `a ${subParts[0].replace(/^a\s+/i, '').toLowerCase()};` : 'a first element;';
    const subB = subParts[1] ? `a ${subParts[1].replace(/^a\s+/i, '').toLowerCase()}.` : 'thereof.';
    const subClaimsX = rightX + 16;
    const subClaimsLines: Array<[string, string]> = [['a)', subA], ['b)', subB]];
    const subClaimPaths: string[] = [];
    subClaimsLines.forEach(([prefix, text]) => {
      const lineSize = fitFontSize(`${prefix} ${text}`, 'serif', rightW - 16, 11, 9);
      const wrapped = wrapText(`${prefix} ${text}`, 32).slice(0, 2);
      wrapped.forEach((wline) => {
        const p = textPath(wline, 'serif', lineSize, subClaimsX, ry, 'left', 'middle');
        subClaimPaths.push(`<path d="${p}" fill="${SOFT}"/>`);
        ry += 16;
      });
    });

    y = boxY + boxH + 22;
    const ruleFooter = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${RULE}" stroke-width="1"/>`;
    y += 18;
    const etymRoot = data.etymology?.match(/\b([a-zāēīōū]{4,})\b/i)?.[1] ?? '—';
    const footerText = `FILED · ${(data.originLanguage ?? 'UNKNOWN').toUpperCase()}, ${etymRoot.toUpperCase()} · ${watermark.toUpperCase()}`;
    const footerSize = fitFontSize(footerText, 'mono', innerW, 10, 7);
    const footerPath = textPath(footerText, 'mono', footerSize, width / 2, y, 'center', 'middle');

    void truncate;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${PAPER}"/>
        <path d="${officePath}" fill="${SOFT}"/>
        <path d="${lettersPath}" fill="${INK}"/>
        <path d="${patentPath}" fill="${SOFT}"/>
        ${headerRule}
        ${boxRect}
        <path d="${figLabelPath}" fill="${META}"/>
        ${morphemePaths.join('\n')}
        <path d="${dashLabelPath}" fill="${META}"/>
        <path d="${titleLabel}" fill="${META}"/>
        <path d="${titlePath}" fill="${INK}"/>
        <path d="${subPath}" fill="${SOFT}"/>
        <path d="${claimsLabel}" fill="${META}"/>
        ${claimPaths.join('\n')}
        ${subClaimPaths.join('\n')}
        ${ruleFooter}
        <path d="${footerPath}" fill="${SOFT}"/>
      </svg>
    `;
  },
};

function splitWordSyllables(word: string): string[] {
  if (word.length <= 4) return [word];
  const mid = Math.ceil(word.length / 2);
  let splitAt = mid;
  for (let off = 0; off < 3; off++) {
    if ('aeiouAEIOU'.includes(word[mid + off] ?? '')) { splitAt = mid + off; break; }
    if ('aeiouAEIOU'.includes(word[mid - off] ?? '')) { splitAt = mid - off; break; }
  }
  return [word.slice(0, splitAt), word.slice(splitAt)];
}
