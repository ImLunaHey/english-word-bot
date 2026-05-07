import type { Design } from './types';
import { textPath, fitFontSize, measureText } from './fonts';
import { entryNumber, extractCentury, truncate } from './utils';

const PAPER = '#d4c8a0';
const INK = '#2a1a0a';
const SOFT = '#4a3a1a';
const SEAL = '#c44d3c';

function starPolygon(cx: number, cy: number, outer: number, inner: number, points = 5): string {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    coords.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return coords.join(' ');
}

export const vocabularyCertificate: Design = {
  name: 'vocabulary-certificate',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const margin = 32;
    const outerInset = 22;
    const innerInset = 26;

    const cx = width / 2;
    let y = 90;

    const numText = `— No. ${entryNumber(data.word)} —`;
    const numPath = textPath(numText, 'serif-italic', 12, cx, y, 'center', 'middle');
    y += 26;

    const titleText = 'CERTIFICATE OF VOCABULARY';
    const titleSize = fitFontSize(titleText, 'serif', width - margin * 2 - 60, 22, 14);
    const titlePath = textPath(titleText, 'serif', titleSize, cx, y, 'center', 'middle');
    y += titleSize + 12;

    const introText = '— this is to certify that the word —';
    const introPath = textPath(introText, 'serif-italic', 12, cx, y, 'center', 'middle');
    y += 32;

    const wordSize = fitFontSize(data.word, 'serif-italic', width - margin * 2 - 80, 44, 22);
    const wordY = y + wordSize / 2;
    const wordPath = textPath(data.word, 'serif-italic', wordSize, cx, wordY, 'center', 'middle');
    y += wordSize + 18;

    const subText = `${data.partOfSpeech || '—'}${data.ipa ? ` · /${data.ipa}/` : ''}`;
    const subSize = fitFontSize(subText, 'mono', width - margin * 2 - 60, 11, 9);
    const subPath = textPath(subText, 'mono', subSize, cx, y, 'center', 'middle');
    y += 28;

    const bodyText = `is a duly recognised member of the English language, signifying "${truncate(data.definition, 60)}"`;
    const bodyLines = wrapTextCentered(bodyText, 50);
    const bodyLineH = 22;
    const bodyPaths = bodyLines.map((line, i) => {
      const lineSize = fitFontSize(line, 'serif', width - margin * 2 - 60, 14, 10);
      const p = textPath(line, 'serif', lineSize, cx, y + i * bodyLineH, 'center', 'middle');
      return `<path d="${p}" fill="${INK}"/>`;
    });
    y += bodyLines.length * bodyLineH + 32;

    const sigCx = cx - 80;
    const sigPath = textPath('englishwordbot', 'serif-italic', 16, sigCx, y, 'center', 'middle');
    const sigW = measureText('englishwordbot', 'serif-italic', 16).width;
    const sigUnderline = `<line x1="${sigCx - sigW / 2 - 6}" y1="${y + 14}" x2="${sigCx + sigW / 2 + 6}" y2="${y + 14}" stroke="${INK}" stroke-width="0.8"/>`;

    const sealCx = cx + 80;
    const sealCy = y;
    const sealR = 32;
    const sealCircle = `<circle cx="${sealCx}" cy="${sealCy}" r="${sealR}" fill="none" stroke="${SEAL}" stroke-width="2.5"/>`;
    const sealInnerCircle = `<circle cx="${sealCx}" cy="${sealCy}" r="${sealR - 4}" fill="none" stroke="${SEAL}" stroke-width="0.8"/>`;
    const sealStarL = starPolygon(0, 0, 4, 1.7);
    const sealStarR = starPolygon(0, 0, 4, 1.7);
    const sealText = textPath('SEAL', 'serif', 11, 0, 0, 'center', 'middle');
    const sealGroup = `<g transform="translate(${sealCx} ${sealCy}) rotate(-8)">
      ${sealCircle.replace(`cx="${sealCx}" cy="${sealCy}"`, 'cx="0" cy="0"')}
      ${sealInnerCircle.replace(`cx="${sealCx}" cy="${sealCy}"`, 'cx="0" cy="0"')}
      <polygon points="${sealStarL}" transform="translate(-22 0)" fill="${SEAL}"/>
      <polygon points="${sealStarR}" transform="translate(22 0)" fill="${SEAL}"/>
      <path d="${sealText}" fill="${SEAL}"/>
    </g>`;
    y += 36;

    const bottomText = `— ISSUED ${(data.originLanguage ?? 'UNKNOWN').toUpperCase()}, ${extractCentury(data.etymology) ?? '—'} · ${watermark.toUpperCase()} —`;
    const bottomSize = fitFontSize(bottomText, 'mono', width - margin * 2 - 40, 10, 7);
    const bottomY = height - 70;
    const bottomPath = textPath(bottomText, 'mono', bottomSize, cx, bottomY, 'center', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${PAPER}"/>
        <rect x="${outerInset}" y="${outerInset}" width="${width - outerInset * 2}" height="${height - outerInset * 2}" fill="none" stroke="${SOFT}" stroke-width="2"/>
        <rect x="${innerInset}" y="${innerInset}" width="${width - innerInset * 2}" height="${height - innerInset * 2}" fill="none" stroke="${SOFT}" stroke-width="1"/>
        <path d="${numPath}" fill="${SOFT}"/>
        <path d="${titlePath}" fill="${INK}"/>
        <path d="${introPath}" fill="${SOFT}"/>
        <path d="${wordPath}" fill="${INK}"/>
        <path d="${subPath}" fill="${SOFT}"/>
        ${bodyPaths.join('\n')}
        <path d="${sigPath}" fill="${INK}"/>
        ${sigUnderline}
        ${sealGroup}
        <path d="${bottomPath}" fill="${SOFT}"/>
      </svg>
    `;
  },
};

function wrapTextCentered(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) {
      if (cur) lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur.trim());
  return lines;
}
