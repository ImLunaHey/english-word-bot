import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, extractCentury, todayISO, wrapText } from './utils';

const BG = '#1a1a1a';
const TEXT = '#f5f3ec';
const SOFT = '#c8c8c8';
const DIM = '#888888';
const RULE = '#555555';
const AMBER = '#f4c478';
const STOP_DIM = '#888888';
const STOP_DARK = '#555555';

const INTERMEDIATE_LANGS = [
  'Old French', 'Middle French', 'Old English', 'Middle English',
  'Anglo-Norman', 'Vulgar Latin', 'Late Latin', 'Medieval Latin',
];

function findIntermediate(etymology: string | null, originLanguage: string | null): string | null {
  if (!etymology) return null;
  for (const lang of INTERMEDIATE_LANGS) {
    if (etymology.includes(lang) && lang !== originLanguage) return lang;
  }
  return null;
}

export const subwayMap: Design = {
  name: 'subway-map',
  canRender: (d) => !!d.definition && !!d.originLanguage,
  render: ({ data, watermark, width, height }) => {
    const padX = 28;
    const innerLeft = padX;
    const innerRight = width - padX;
    const innerW = innerRight - innerLeft;

    let y = 36;
    const pillText = '> LEXICON LINE';
    const pillSize = 12;
    const pillW = 170;
    const pillH = 24;
    const pillX = innerLeft;
    const pillY = y - pillH / 2;
    const pillRect = `<rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" fill="${AMBER}"/>`;
    const pillTextPath = textPath(pillText, 'sans-bold', pillSize, pillX + pillW / 2, y, 'center', 'middle');

    const datePath = textPath(todayISO().replace(/-/g, '·'), 'mono', 10, innerRight, y, 'right', 'middle');
    y += 20;
    const headerRule = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${RULE}" stroke-width="0.5"/>`;
    y += 26;

    const arrivingLabel = textPath('NOW ARRIVING AT', 'mono', 10, innerLeft, y, 'left', 'middle');
    y += 28;
    const wordSize = fitFontSize(data.word, 'sans-bold', innerW, 36, 18);
    const wordPath = textPath(data.word, 'sans-bold', wordSize, innerLeft, y, 'left', 'middle');
    y += wordSize / 2 + 18;
    const subText = `/${data.ipa ?? '—'}/ · ${data.partOfSpeech || 'word'}`;
    const subSize = fitFontSize(subText, 'mono', innerW, 11, 9);
    const subPath = textPath(subText, 'mono', subSize, innerLeft, y, 'left', 'middle');
    y += 28;

    const intermediate = findIntermediate(data.etymology, data.originLanguage);
    const stops: Array<{ name: string; date: string; type: 'origin' | 'mid' | 'now' }> = [];
    stops.push({ name: data.originLanguage!.toUpperCase(), date: extractCentury(data.etymology) ?? '·', type: 'origin' });
    if (intermediate) {
      stops.push({ name: intermediate.toUpperCase(), date: '·', type: 'mid' });
    }
    stops.push({ name: 'ENGLISH', date: 'today', type: 'now' });

    const trackY = y + 30;
    const stopGap = innerW / (stops.length - 1);
    const trackOut: string[] = [];
    const stopXs = stops.map((_, i) => innerLeft + 30 + (innerW - 60) * (i / (stops.length - 1)));
    if (stops.length === 1) stopXs[0] = innerLeft + innerW / 2;

    for (let i = 0; i < stops.length - 1; i++) {
      const xs = stopXs[i] + 16;
      const xe = stopXs[i + 1] - 16;
      if (i === 0 && stops.length > 2) {
        const gradId = `g-${i}-grad`;
        trackOut.push(`<defs><linearGradient id="${gradId}" x1="0" x2="1"><stop offset="0%" stop-color="${STOP_DIM}"/><stop offset="100%" stop-color="${AMBER}"/></linearGradient></defs>`);
        trackOut.push(`<rect x="${xs}" y="${trackY - 1.5}" width="${xe - xs}" height="3" fill="url(#${gradId})"/>`);
      } else if (i === 0 && stops.length === 2) {
        const gradId = `g-${i}-grad-2`;
        trackOut.push(`<defs><linearGradient id="${gradId}" x1="0" x2="1"><stop offset="0%" stop-color="${STOP_DIM}"/><stop offset="100%" stop-color="${AMBER}"/></linearGradient></defs>`);
        trackOut.push(`<rect x="${xs}" y="${trackY - 1.5}" width="${xe - xs}" height="3" fill="url(#${gradId})"/>`);
      } else {
        trackOut.push(`<rect x="${xs}" y="${trackY - 1.5}" width="${xe - xs}" height="3" fill="${AMBER}"/>`);
      }
    }

    stops.forEach((stop, i) => {
      const cx = stopXs[i];
      if (stop.type === 'now') {
        trackOut.push(`<circle cx="${cx}" cy="${trackY}" r="11" fill="${AMBER}" stroke="${TEXT}" stroke-width="2"/>`);
      } else if (stop.type === 'origin') {
        trackOut.push(`<circle cx="${cx}" cy="${trackY}" r="7" fill="${STOP_DARK}"/>`);
      } else {
        trackOut.push(`<circle cx="${cx}" cy="${trackY}" r="7" fill="${STOP_DIM}"/>`);
      }
      const nameSize = fitFontSize(stop.name, 'mono', stopGap - 16, stop.type === 'now' ? 11 : 10, 7);
      const np = textPath(stop.name, 'mono', nameSize, cx, trackY + 26, 'center', 'middle');
      trackOut.push(`<path d="${np}" fill="${stop.type === 'now' ? AMBER : (stop.type === 'origin' ? DIM : SOFT)}"/>`);
      const dp = textPath(stop.date, 'mono', 9, cx, trackY + 42, 'center', 'middle');
      trackOut.push(`<path d="${dp}" fill="${stop.type === 'now' ? AMBER : DIM}"/>`);
      if (stop.type === 'now') {
        const here = textPath('v HERE', 'mono', 9, cx, trackY + 56, 'center', 'middle');
        trackOut.push(`<path d="${here}" fill="${AMBER}"/>`);
      }
    });

    y = trackY + 80;

    const defLines = wrapText(data.definition, 50).slice(0, 3);
    const blockX = innerLeft;
    const blockW = innerW;
    const blockTop = y;
    const blockPadX = 14;
    let by = blockTop + 22;
    const defPaths: string[] = [];
    defLines.forEach((line) => {
      const lineSize = fitFontSize(line, 'sans-bold', blockW - blockPadX * 2 - 6, 13, 10);
      const p = textPath(line, 'sans-bold', lineSize, blockX + blockPadX + 6, by, 'left', 'middle');
      defPaths.push(`<path d="${p}" fill="${TEXT}"/>`);
      by += 20;
    });
    const blockH = (by - blockTop) + 6;
    const blockRect = `<rect x="${blockX}" y="${blockTop}" width="${blockW}" height="${blockH}" fill="${AMBER}" fill-opacity="0.1"/>`;
    const accentBar = `<rect x="${blockX}" y="${blockTop}" width="3" height="${blockH}" fill="${AMBER}"/>`;

    const footerY = height - 24;
    const footerLeft = textPath('NEXT STOP: TBD', 'mono', 10, innerLeft, footerY, 'left', 'middle');
    const footerRight = textPath(`${watermark.replace(/^@/, '').toUpperCase()} · NO.${entryNumber(data.word)}`, 'mono', 10, innerRight, footerY, 'right', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        ${pillRect}
        <path d="${pillTextPath}" fill="${BG}"/>
        <path d="${datePath}" fill="${DIM}"/>
        ${headerRule}
        <path d="${arrivingLabel}" fill="${AMBER}"/>
        <path d="${wordPath}" fill="${TEXT}"/>
        <path d="${subPath}" fill="${SOFT}"/>
        ${trackOut.join('\n')}
        ${blockRect}
        ${accentBar}
        ${defPaths.join('\n')}
        <path d="${footerLeft}" fill="${DIM}"/>
        <path d="${footerRight}" fill="${DIM}"/>
      </svg>
    `;
  },
};
