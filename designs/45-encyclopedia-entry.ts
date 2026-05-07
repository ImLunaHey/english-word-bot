import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, rarityStars, truncate, wrapText } from './utils';

const PAPER = '#f0ebde';
const INK = '#2a1a0a';
const META = '#5a4a2a';
const RULE = '#5a4a2a';
const BOX_BG_OPACITY = 0.08;
const BOX_BORDER = '#5a4a2a';

function rarityDescription(stars: number): string {
  if (stars >= 4) return 'Archaic — chiefly historical or legal contexts.';
  if (stars === 3) return 'Uncommon in modern usage.';
  return 'Common in everyday speech.';
}

export const encyclopediaEntry: Design = {
  name: 'encyclopedia-entry',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const padX = 28;
    const innerLeft = padX;
    const innerRight = width - padX;
    const innerW = innerRight - innerLeft;

    let y = 32;
    const headerLeft = textPath(`ENCYCLOPAEDIA · VOL. ${data.word.charAt(0).toUpperCase()}`, 'mono', 10, innerLeft, y, 'left', 'middle');
    const headerRight = textPath(`PG. ${entryNumber(data.word)}`, 'mono', 10, innerRight, y, 'right', 'middle');
    y += 14;
    const headerRule = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${RULE}" stroke-width="1"/>`;
    y += 24;

    const colGap = 18;
    const leftW = (innerW - colGap) * 0.55;
    const rightX = innerLeft + leftW + colGap;
    const rightW = innerW - leftW - colGap;

    let lyy = y;
    const wordSize = fitFontSize(data.word, 'serif', leftW, 26, 16);
    const wordPath = textPath(data.word, 'serif', wordSize, innerLeft, lyy, 'left', 'middle');
    lyy += wordSize / 2 + 14;
    const ipaPath = textPath(`/${data.ipa ?? '—'}/, ${data.partOfSpeech ? `${data.partOfSpeech.charAt(0).toLowerCase()}.` : 'n.'}`, 'mono', 11, innerLeft, lyy, 'left', 'middle');
    lyy += 24;

    const articleText = `${data.word.toUpperCase()}, ${data.partOfSpeech || 'word'}, ${data.definition.replace(/\.$/, '')}.${data.etymology ? ` ${truncate(data.etymology, 110)}` : ''}`;
    const articleLines = wrapText(articleText, 38).slice(0, 9);
    const articleLineH = 18;
    const articlePaths = articleLines.map((line, i) => {
      const lineSize = fitFontSize(line, 'serif', leftW, 12, 10);
      const p = textPath(line, 'serif', lineSize, innerLeft, lyy + i * articleLineH, 'left', 'middle');
      return `<path d="${p}" fill="${INK}"/>`;
    });

    let ryy = y;
    const boxes: Array<{ label: string; lines: string[] }> = [];

    const etymBoxLines = data.etymology
      ? wrapText(truncate(data.etymology, 100), 28).slice(0, 3)
      : ['Origin uncertain.'];
    boxes.push({ label: 'ETYMOLOGY', lines: etymBoxLines });

    const crossRefValue = data.definition.toLowerCase().match(/\b[a-z]{5,}\b/g)?.slice(0, 3).join(' · ') ?? '—';
    boxes.push({ label: 'CROSS-REF', lines: wrapText(crossRefValue, 30).slice(0, 2) });

    const stars = rarityStars(data.word);
    boxes.push({ label: 'RARITY', lines: wrapText(rarityDescription(stars), 28).slice(0, 3) });

    const boxOut: string[] = [];
    const boxPadX = 10;
    const boxPadY = 8;
    const boxLineH = 16;
    boxes.forEach((box) => {
      const labelH = 18;
      const contentH = box.lines.length * boxLineH;
      const boxH = labelH + contentH + boxPadY * 2;
      boxOut.push(`<rect x="${rightX}" y="${ryy}" width="${rightW}" height="${boxH}" fill="${BOX_BORDER}" fill-opacity="${BOX_BG_OPACITY}"/>`);
      boxOut.push(`<rect x="${rightX}" y="${ryy}" width="3" height="${boxH}" fill="${BOX_BORDER}"/>`);
      const labelPath = textPath(box.label, 'mono', 9, rightX + boxPadX, ryy + boxPadY + 6, 'left', 'middle');
      boxOut.push(`<path d="${labelPath}" fill="${META}"/>`);
      box.lines.forEach((line, i) => {
        const lineSize = fitFontSize(line, box.label === 'CROSS-REF' ? 'serif-italic' : 'serif', rightW - boxPadX * 2, 11, 9);
        const lp = textPath(line, box.label === 'CROSS-REF' ? 'serif-italic' : 'serif', lineSize, rightX + boxPadX, ryy + boxPadY + labelH + 6 + i * boxLineH, 'left', 'middle');
        boxOut.push(`<path d="${lp}" fill="${INK}"/>`);
      });
      ryy += boxH + 10;
    });

    const footerY = height - 28;
    const footerRule = `<line x1="${innerLeft}" y1="${footerY - 14}" x2="${innerRight}" y2="${footerY - 14}" stroke="${RULE}" stroke-width="1"/>`;
    const footerPath = textPath(`— ${watermark.toUpperCase()} EDITION —`, 'mono', 10, width / 2, footerY, 'center', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${PAPER}"/>
        <path d="${headerLeft}" fill="${META}"/>
        <path d="${headerRight}" fill="${META}"/>
        ${headerRule}
        <path d="${wordPath}" fill="${INK}"/>
        <path d="${ipaPath}" fill="${META}"/>
        ${articlePaths.join('\n')}
        ${boxOut.join('\n')}
        ${footerRule}
        <path d="${footerPath}" fill="${META}"/>
      </svg>
    `;
  },
};
