import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { capitalize, entryNumber, extractCentury, posAbbrev, rarityStars, truncate, wrapText } from './utils';

const PAPER = '#f8f6ef';
const INK = '#1a1a1a';
const SOFT = '#555555';
const RULE = '#c8c8b8';
const REF = '#2a4a8a';
const INFO_BG = '#ebe8de';
const INFO_BORDER = '#c8c8b8';
const INFO_HEADER_BG = '#1a2a4a';
const INFO_HEADER_TEXT = '#ffffff';
const INFO_LABEL_BG = '#d4dae4';
const INFO_LABEL_TEXT = '#1a2a4a';
const RED = '#c44d3c';

function status(stars: number): { text: string; color: string } {
  if (stars >= 4) return { text: 'archaic', color: RED };
  if (stars === 3) return { text: 'uncommon', color: SOFT };
  return { text: 'common', color: INK };
}

export const wikipediaInfobox: Design = {
  name: 'wikipedia-infobox',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const padX = 28;
    const innerLeft = padX;
    const innerRight = width - padX;
    const innerW = innerRight - innerLeft;

    const colGap = 16;
    const leftW = (innerW - colGap) * 0.58;
    const rightX = innerLeft + leftW + colGap;
    const rightW = innerW - leftW - colGap;

    let ly = 36;
    const titleSize = fitFontSize(capitalize(data.word), 'serif', leftW, 30, 18);
    const titlePath = textPath(capitalize(data.word), 'serif', titleSize, innerLeft, ly, 'left', 'middle');
    ly += titleSize / 2 + 12;
    const subtitlePath = textPath('From Wordpedia, the open vocabulary', 'serif-italic', 11, innerLeft, ly, 'left', 'middle');
    ly += 12;
    const titleRule = `<line x1="${innerLeft}" y1="${ly}" x2="${innerLeft + leftW}" y2="${ly}" stroke="${RULE}" stroke-width="1"/>`;
    ly += 22;

    const leadText = `${capitalize(data.word)} (/${data.ipa ?? '—'}/; ${data.partOfSpeech || 'word'}) is ${data.definition.replace(/\.$/, '').toLowerCase()}${data.etymology ? `, ${truncate(data.etymology.toLowerCase(), 100)}` : ''}.`;
    const leadLines = wrapText(leadText, 38).slice(0, 6);
    const leadPaths = leadLines.map((line) => {
      const lineSize = fitFontSize(line, 'serif', leftW, 12, 9);
      const p = textPath(line, 'serif', lineSize, innerLeft, ly, 'left', 'middle');
      ly += 16;
      return `<path d="${p}" fill="${INK}"/>`;
    });

    if (leadLines.length > 0) {
      const refPath = textPath('[1]', 'serif', 9, innerLeft + leftW - 16, ly - 10, 'left', 'middle');
      leadPaths.push(`<path d="${refPath}" fill="${REF}"/>`);
    }
    ly += 8;

    const century = extractCentury(data.etymology);
    const historyText = `First attested in the ${century ?? 'historical past'}, the term was used in ${data.originLanguage ?? 'earlier'} contexts.`;
    const historyLines = wrapText(historyText, 38).slice(0, 3);
    const historyPaths = historyLines.map((line) => {
      const lineSize = fitFontSize(line, 'serif', leftW, 11, 9);
      const p = textPath(line, 'serif', lineSize, innerLeft, ly, 'left', 'middle');
      ly += 16;
      return `<path d="${p}" fill="#2a2a2a"/>`;
    });
    ly += 6;

    const seeAlsoTokens = data.definition.toLowerCase().match(/\b[a-z]{5,}\b/g)?.slice(0, 2).join(', ') ?? '—';
    const seeAlsoPath = textPath(`> See also: ${seeAlsoTokens}`, 'serif', 11, innerLeft, ly, 'left', 'middle');

    const infoX = rightX;
    const infoY = 32;
    const infoH = height - 64;
    const infoRect = `<rect x="${infoX}" y="${infoY}" width="${rightW}" height="${infoH}" fill="${INFO_BG}" stroke="${INFO_BORDER}" stroke-width="1"/>`;

    const headerH = 26;
    const infoHeaderRect = `<rect x="${infoX}" y="${infoY}" width="${rightW}" height="${headerH}" fill="${INFO_HEADER_BG}"/>`;
    const infoHeaderTextSize = fitFontSize(capitalize(data.word), 'sans-bold', rightW - 16, 13, 9);
    const infoHeaderTextPath = textPath(capitalize(data.word), 'sans-bold', infoHeaderTextSize, infoX + rightW / 2, infoY + headerH / 2, 'center', 'middle');

    const wordBoxY = infoY + headerH + 12;
    const wordBoxH = 70;
    const wordBoxX = infoX + 12;
    const wordBoxW = rightW - 24;
    const wordBoxRect = `<rect x="${wordBoxX}" y="${wordBoxY}" width="${wordBoxW}" height="${wordBoxH}" fill="${PAPER}" stroke="${INFO_BORDER}" stroke-width="1"/>`;
    const wordBoxSize = fitFontSize(data.word, 'serif-italic', wordBoxW - 12, 22, 12);
    const wordBoxPath = textPath(data.word, 'serif-italic', wordBoxSize, infoX + rightW / 2, wordBoxY + wordBoxH / 2, 'center', 'middle');

    const captionY = wordBoxY + wordBoxH + 16;
    const captionText = `— ${truncate(data.definition, 28)} —`;
    const captionSize = fitFontSize(captionText, 'serif-italic', rightW - 16, 10, 8);
    const captionPath = textPath(captionText, 'serif-italic', captionSize, infoX + rightW / 2, captionY, 'center', 'middle');

    let iy = captionY + 22;
    const sectionLabelH = 18;
    const sectionTextOffset = 22;
    const rowH = 16;
    const labelColW = 50;

    const renderSection = (label: string, rows: Array<[string, string, string?]>): string[] => {
      const out: string[] = [];
      out.push(`<rect x="${infoX + 8}" y="${iy}" width="${rightW - 16}" height="${sectionLabelH}" fill="${INFO_LABEL_BG}"/>`);
      const lp = textPath(label, 'mono', 9, infoX + 14, iy + sectionLabelH / 2, 'left', 'middle');
      out.push(`<path d="${lp}" fill="${INFO_LABEL_TEXT}"/>`);
      iy += sectionTextOffset;
      rows.forEach(([rowLabel, rowValue, valueColor]) => {
        const rlp = textPath(rowLabel, 'mono', 10, infoX + 14, iy, 'left', 'middle');
        out.push(`<path d="${rlp}" fill="${SOFT}"/>`);
        const valueX = infoX + 14 + labelColW;
        const valueSize = fitFontSize(rowValue, 'mono', rightW - labelColW - 24, 10, 8);
        const rvp = textPath(rowValue, 'mono', valueSize, valueX, iy, 'left', 'middle');
        out.push(`<path d="${rvp}" fill="${valueColor ?? INK}"/>`);
        iy += rowH;
      });
      iy += 6;
      return out;
    };

    const stars = rarityStars(data.word);
    const stat = status(stars);
    const classOut = renderSection('CLASSIFICATION', [
      ['Type', data.partOfSpeech ? posAbbrev(data.partOfSpeech) : '—'],
      ['IPA', data.ipa ? `/${data.ipa}/` : '—'],
      ['Letters', String(data.word.length)],
    ]);
    const etymOut = renderSection('ETYMOLOGY', [
      ['From', data.originLanguage ?? '—'],
      ['First use', century ? `${century}` : '—'],
      ['Status', stat.text, stat.color],
    ]);

    const infoFooterY = infoY + infoH - 14;
    const infoFooterPath = textPath(`EWB · ${entryNumber(data.word)}`, 'mono', 9, infoX + rightW / 2, infoFooterY, 'center', 'middle');
    const infoFooterRule = `<line x1="${infoX + 8}" y1="${infoFooterY - 14}" x2="${infoX + rightW - 8}" y2="${infoFooterY - 14}" stroke="${INFO_BORDER}" stroke-width="0.5"/>`;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${PAPER}"/>
        <path d="${titlePath}" fill="${INK}"/>
        <path d="${subtitlePath}" fill="${SOFT}"/>
        ${titleRule}
        ${leadPaths.join('\n')}
        ${historyPaths.join('\n')}
        <path d="${seeAlsoPath}" fill="${REF}"/>
        ${infoRect}
        ${infoHeaderRect}
        <path d="${infoHeaderTextPath}" fill="${INFO_HEADER_TEXT}"/>
        ${wordBoxRect}
        <path d="${wordBoxPath}" fill="${INK}"/>
        <path d="${captionPath}" fill="${SOFT}"/>
        ${classOut.join('\n')}
        ${etymOut.join('\n')}
        ${infoFooterRule}
        <path d="${infoFooterPath}" fill="${SOFT}"/>
      </svg>
    `;
  },
};
