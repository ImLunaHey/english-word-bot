import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { todayISO, truncate } from './utils';

const BG = '#2a3540';
const PAPER = '#fafaf2';
const PHOTO_BG = '#1a1a1a';
const PHOTO_TEXT = '#f4ead0';
const PHOTO_ACCENT = '#d4a574';
const PHOTO_SOFT = '#c8baa0';
const RULE = '#5a4a3a';
const CAPTION_INK = '#2a1a0a';
const SHADOW = '#0a1118';

export const polaroid: Design = {
  name: 'polaroid',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const polW = Math.round(width * 0.72);
    const photoH = polW - 28;
    const captionH = 64;
    const polH = photoH + captionH + 14;
    const polX = (width - polW) / 2;
    const polY = (height - polH) / 2;
    const polCx = polX + polW / 2;
    const polCy = polY + polH / 2;
    const photoX = polX + 14;
    const photoY = polY + 14;
    const photoW = polW - 28;

    const today = todayISO().replace(/-/g, '·');
    const capturedPath = textPath(`CAPTURED ${today}`, 'mono', 10, photoX + photoW / 2, photoY + 32, 'center', 'middle');

    const wordSize = fitFontSize(data.word, 'serif-italic', photoW - 24, 32, 14);
    const wordY = photoY + photoH / 2 - 8;
    const wordPath = textPath(data.word, 'serif-italic', wordSize, photoX + photoW / 2, wordY, 'center', 'middle');

    const ipaY = wordY + wordSize / 2 + 22;
    const ipaText = data.ipa ? `/${data.ipa}/` : (data.partOfSpeech || '—');
    const ipaSize = fitFontSize(ipaText, 'mono', photoW - 24, 11, 8);
    const ipaPath = textPath(ipaText, 'mono', ipaSize, photoX + photoW / 2, ipaY, 'center', 'middle');

    const ruleY = ipaY + 14;
    const ruleW = photoW * 0.4;
    const ruleLine = `<line x1="${photoX + photoW / 2 - ruleW / 2}" y1="${ruleY}" x2="${photoX + photoW / 2 + ruleW / 2}" y2="${ruleY}" stroke="${RULE}" stroke-width="0.5"/>`;

    const defText = `"${truncate(data.definition, 36)}"`;
    const defSize = fitFontSize(defText, 'serif-italic', photoW - 32, 12, 9);
    const defY = ruleY + 22;
    const defPath = textPath(defText, 'serif-italic', defSize, photoX + photoW / 2, defY, 'center', 'middle');

    const captionY = polY + photoH + 14 + captionH / 2 - 4;
    const captionText = `${data.word} · ${(data.partOfSpeech || '—')} · ${new Date().getFullYear()}`;
    const captionSize = fitFontSize(captionText, 'serif-italic', polW - 28, 16, 10);
    const captionPath = textPath(captionText, 'serif-italic', captionSize, polCx, captionY, 'center', 'middle');

    const watermarkY = polY + polH + 36;
    const watermarkPath = textPath(watermark, 'mono', 10, width / 2, watermarkY, 'center', 'middle');

    const polGroup = `<g transform="rotate(-2 ${polCx} ${polCy})">
      <rect x="${polX + 8}" y="${polY + 8}" width="${polW}" height="${polH}" fill="${SHADOW}"/>
      <rect x="${polX}" y="${polY}" width="${polW}" height="${polH}" fill="${PAPER}"/>
      <rect x="${photoX}" y="${photoY}" width="${photoW}" height="${photoH}" fill="${PHOTO_BG}"/>
      <path d="${capturedPath}" fill="${PHOTO_ACCENT}"/>
      <path d="${wordPath}" fill="${PHOTO_TEXT}"/>
      <path d="${ipaPath}" fill="${PHOTO_ACCENT}"/>
      ${ruleLine}
      <path d="${defPath}" fill="${PHOTO_SOFT}"/>
      <path d="${captionPath}" fill="${CAPTION_INK}"/>
    </g>`;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        ${polGroup}
        <path d="${watermarkPath}" fill="${PHOTO_SOFT}" fill-opacity="0.5"/>
      </svg>
    `;
  },
};
