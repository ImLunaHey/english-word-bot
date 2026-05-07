import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, splitWord, wrapText } from './utils';

const LIGHT_BG = '#f5f1e4';
const DARK_BG = '#1a1a1a';
const DARK_TEXT = '#f5f1e4';
const ACCENT_DARK = '#d4a574';
const DIM_DARK = '#888888';
const LIGHT_INK = '#1a1a1a';
const ACCENT_LIGHT = '#c44d3c';
const ETYM_INK = '#3a3a2a';
const RULE = '#c4b896';

export const splitPanelEditorial: Design = {
  name: 'split-panel-editorial',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const halfW = width / 2;
    const padDark = 32;
    const padLight = 32;

    const entryPath = textPath(`ENTRY · ${entryNumber(data.word)}`, 'mono', 12, padDark, 50, 'left', 'middle');

    const wordLines = splitWord(data.word);
    const longest = wordLines.reduce((a, b) => a.length > b.length ? a : b);
    const wordSize = fitFontSize(longest, 'serif-italic', halfW - padDark * 2, 64, 28);
    const lineH = wordSize * 1.0;
    const totalH = lineH * wordLines.length;
    const wordTopY = height / 2 - totalH / 2 - 30;

    const wordPathSegments = wordLines.map((line, i) => {
      const p = textPath(line, 'serif-italic', wordSize, padDark, wordTopY + i * lineH + lineH / 2, 'left', 'middle');
      return `<path d="${p}" fill="${DARK_TEXT}"/>`;
    });

    let ipaSection = '';
    if (data.ipa) {
      const ipaY = wordTopY + totalH + 24;
      const ipaPath = textPath(`/${data.ipa}/`, 'mono', 12, padDark, ipaY, 'left', 'middle');
      ipaSection = `<path d="${ipaPath}" fill="${ACCENT_DARK}"/>`;
    }

    const ewbPath = textPath('EWB.BSKY', 'mono', 11, padDark, height - 36, 'left', 'middle');

    let y = padLight + 24;
    const lightX = halfW + padLight;
    const lightMaxW = halfW - padLight * 2;

    const sections: string[] = [];

    sections.push(`<path d="${textPath('DEFINITION', 'mono', 12, lightX, y, 'left', 'middle')}" fill="${ACCENT_LIGHT}"/>`);
    y += 22;
    const defLines = wrapText(data.definition, 32).slice(0, 3);
    const defLineH = 22;
    defLines.forEach(line => {
      const size = fitFontSize(line, 'serif', lightMaxW, 16, 11);
      const p = textPath(line, 'serif', size, lightX, y, 'left', 'middle');
      sections.push(`<path d="${p}" fill="${LIGHT_INK}"/>`);
      y += defLineH;
    });
    y += 6;
    sections.push(`<line x1="${lightX}" y1="${y}" x2="${width - padLight}" y2="${y}" stroke="${RULE}" stroke-width="1"/>`);
    y += 14;

    sections.push(`<path d="${textPath('ETYMOLOGY', 'mono', 12, lightX, y, 'left', 'middle')}" fill="${ACCENT_LIGHT}"/>`);
    y += 22;
    const etymText = data.etymology ?? '—';
    const etymLines = wrapText(etymText, 34).slice(0, 3);
    const etymLineH = 20;
    etymLines.forEach(line => {
      const size = fitFontSize(line, 'serif', lightMaxW, 14, 10);
      const p = textPath(line, 'serif', size, lightX, y, 'left', 'middle');
      sections.push(`<path d="${p}" fill="${ETYM_INK}"/>`);
      y += etymLineH;
    });
    y += 6;
    sections.push(`<line x1="${lightX}" y1="${y}" x2="${width - padLight}" y2="${y}" stroke="${RULE}" stroke-width="1"/>`);
    y += 14;

    sections.push(`<path d="${textPath('CLASS', 'mono', 12, lightX, y, 'left', 'middle')}" fill="${ACCENT_LIGHT}"/>`);
    y += 22;
    const classText = data.partOfSpeech
      ? `${data.partOfSpeech}${data.originLanguage ? ` · ${data.originLanguage}` : ''}`
      : (data.originLanguage ?? '—');
    const classSize = fitFontSize(classText, 'serif', lightMaxW, 14, 10);
    const cp = textPath(classText, 'serif', classSize, lightX, y, 'left', 'middle');
    sections.push(`<path d="${cp}" fill="${LIGHT_INK}"/>`);

    const watermarkPath = textPath(watermark, 'mono', 11, width - padLight, height - 36, 'right', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${LIGHT_BG}"/>
        <rect x="0" y="0" width="${halfW}" height="${height}" fill="${DARK_BG}"/>
        <path d="${entryPath}" fill="${ACCENT_DARK}"/>
        ${wordPathSegments.join('\n')}
        ${ipaSection}
        <path d="${ewbPath}" fill="${DIM_DARK}"/>
        ${sections.join('\n')}
        <path d="${watermarkPath}" fill="${ETYM_INK}"/>
      </svg>
    `;
  },
};
