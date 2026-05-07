import type { Design } from './types';
import { textPath, fitFontSize, measureText } from './fonts';

const BG = '#fef6ec';
const INK = '#4a3520';
const PILL_BG = '#f4d4a8';
const PILL_TEXT = '#6b4423';
const ACCENT = '#8b6f4e';
const BODY = '#5a4530';

export const softPastelModern: Design = {
  name: 'soft-pastel-modern',
  canRender: () => true,
  render: ({ data, watermark, width, height }) => {
    const padding = 80;

    const pillText = (data.partOfSpeech || 'word').toUpperCase();
    const pillSize = 14;
    const pillW = measureText(pillText, 'sans-bold', pillSize).width + 36;
    const pillH = 32;
    const pillX = padding;
    const pillY = padding;
    const pillTextPath = textPath(pillText, 'sans-bold', pillSize, pillX + pillW / 2, pillY + pillH / 2, 'center', 'middle');

    const wordSize = fitFontSize(data.word, 'sans-bold', width - padding * 2, 100, 50);
    const wordY = height / 2 - 20;
    const wordPath = textPath(data.word, 'sans-bold', wordSize, padding, wordY, 'left', 'middle');

    let ipaPath = '';
    if (data.ipa) {
      ipaPath = textPath(`/${data.ipa}/`, 'serif-italic', 18, padding, wordY + wordSize / 2 + 30, 'left', 'middle');
    }

    let defPath = '';
    if (data.definition) {
      const short = data.definition.length > 75 ? data.definition.slice(0, 72) + '...' : data.definition;
      defPath = textPath(short, 'sans-bold', 16, padding, wordY + wordSize / 2 + 70, 'left', 'middle');
    }

    const watermarkPath = textPath(watermark, 'mono', 13, padding, height - padding, 'left', 'middle');

    const starCx = width - padding;
    const starCy = height - padding;
    const starPoints: string[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 8 : 3.5;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      starPoints.push(`${starCx + r * Math.cos(a)},${starCy + r * Math.sin(a)}`);
    }

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="${PILL_BG}"/>
        <path d="${pillTextPath}" fill="${PILL_TEXT}"/>
        <path d="${wordPath}" fill="${INK}"/>
        ${ipaPath ? `<path d="${ipaPath}" fill="${ACCENT}"/>` : ''}
        ${defPath ? `<path d="${defPath}" fill="${BODY}"/>` : ''}
        <path d="${watermarkPath}" fill="${ACCENT}"/>
        <polygon points="${starPoints.join(' ')}" fill="${ACCENT}"/>
      </svg>
    `;
  },
};
