import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, extractCentury, hash, wrapText } from './utils';

const PAPER = '#f5e8d0';
const INK = '#1a1a1a';
const ACCENT = '#c44d3c';
const SOFT = '#4a3a2a';
const FOOTER_INK = '#f5e8d0';

const STAGE_NAMES = [
  'THE ENTRANCING',
  'THE ELOQUENT',
  'THE RESPLENDENT',
  'THE ENIGMATIC',
  'THE INIMITABLE',
  'THE SUBLIME',
  'THE LEGENDARY',
];

function starPolygon(cx: number, cy: number, outer: number, inner: number, points = 5): string {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    coords.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return coords.join(' ');
}

export const concertPoster: Design = {
  name: 'concert-poster',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const padX = 32;
    const headerH = 80;
    const footerH = 44;

    const tonightY = 32;
    const tonightPath = textPath('TONIGHT ONLY', 'mono', 11, width / 2, tonightY, 'center', 'middle');
    const tonightW = 200;
    const starsLeft: string[] = [];
    const starsRight: string[] = [];
    for (let i = 0; i < 3; i++) {
      starsLeft.push(`<polygon points="${starPolygon(width / 2 - tonightW / 2 - 12 - i * 14, tonightY, 4, 1.7)}" fill="${ACCENT}"/>`);
      starsRight.push(`<polygon points="${starPolygon(width / 2 + tonightW / 2 + 12 + i * 14, tonightY, 4, 1.7)}" fill="${ACCENT}"/>`);
    }
    const presentsY = tonightY + 22;
    const presentsPath = textPath('englishwordbot presents', 'serif-italic', 14, width / 2, presentsY, 'center', 'middle');

    const stageNameIndex = hash(data.word) % STAGE_NAMES.length;
    const stageName = STAGE_NAMES[stageNameIndex];
    const stageY = headerH + 50;
    const stageNamePath = textPath(`— ${stageName} —`, 'serif', 12, width / 2, stageY, 'center', 'middle');

    const wordUpper = data.word.toUpperCase();
    const wordSize = fitFontSize(wordUpper, 'sans-bold', width - padX * 2, 60, 20);
    const wordY = stageY + 70;
    const wordPath = textPath(wordUpper, 'sans-bold', wordSize, width / 2, wordY, 'center', 'middle');

    const ipaY = wordY + wordSize / 2 + 30;
    const ipaText = [data.ipa ? `/${data.ipa}/` : null, data.partOfSpeech || null].filter(Boolean).join('  ·  ') || '—';
    const ipaPath = textPath(ipaText, 'serif-italic', 13, width / 2, ipaY, 'center', 'middle');

    const ruleY = ipaY + 32;
    const ruleW = (width - padX * 2) * 0.5;
    const rule = `<line x1="${(width - ruleW) / 2}" y1="${ruleY}" x2="${(width + ruleW) / 2}" y2="${ruleY}" stroke="${INK}" stroke-width="1"/>`;

    const defLines = wrapText(`"${data.definition}"`, 38).slice(0, 2);
    const defStartY = ruleY + 30;
    const defPaths = defLines.map((line, i) => {
      const lineSize = fitFontSize(line, 'serif', width - padX * 2 - 40, 14, 10);
      const p = textPath(line, 'serif', lineSize, width / 2, defStartY + i * 22, 'center', 'middle');
      return `<path d="${p}" fill="${SOFT}"/>`;
    });

    const footerY = height - footerH / 2;
    const footerLeftText = `FROM ${(data.originLanguage ?? 'UNKNOWN').toUpperCase()} · ${extractCentury(data.etymology) ?? '—'}`;
    const footerLeftPath = textPath(footerLeftText, 'mono', 11, padX, footerY, 'left', 'middle');
    const footerRightText = `${watermark.replace(/^@/, '').toUpperCase()} · NO.${entryNumber(data.word)}`;
    const footerRightPath = textPath(footerRightText, 'mono', 11, width - padX, footerY, 'right', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${PAPER}"/>
        ${starsLeft.join('')}
        <path d="${tonightPath}" fill="${ACCENT}"/>
        ${starsRight.join('')}
        <path d="${presentsPath}" fill="${INK}"/>
        <line x1="0" y1="${headerH}" x2="${width}" y2="${headerH}" stroke="${INK}" stroke-width="3"/>
        <path d="${stageNamePath}" fill="${INK}"/>
        <path d="${wordPath}" fill="${INK}"/>
        <path d="${ipaPath}" fill="${SOFT}"/>
        ${rule}
        ${defPaths.join('\n')}
        <rect x="0" y="${height - footerH}" width="${width}" height="${footerH}" fill="${INK}"/>
        <path d="${footerLeftPath}" fill="${FOOTER_INK}"/>
        <path d="${footerRightPath}" fill="${FOOTER_INK}"/>
      </svg>
    `;
  },
};
