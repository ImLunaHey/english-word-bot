import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, rarityStars, starGlyphs, todayISO, truncate, wrapText } from './utils';

const BG = '#c8c4b8';
const YELLOW = '#f5e8a8';
const GREEN = '#c4d8a8';
const PINK = '#f4c4c4';
const SHADOW = 'rgba(0,0,0,0.18)';
const INK = '#2a1a0a';
const META = '#5a4a2a';

export const stickyNotePile: Design = {
  name: 'sticky-note-pile',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const noteSize = Math.round(width * 0.62);
    const cx = width / 2;
    const cy = height / 2;

    const buildNote = (
      bgColor: string,
      rotation: number,
      offsetX: number,
      offsetY: number,
      content: string,
    ) => {
      const nx = cx - noteSize / 2 + offsetX;
      const ny = cy - noteSize / 2 + offsetY;
      return `<g transform="rotate(${rotation} ${cx} ${cy})">
        <rect x="${nx + 6}" y="${ny + 6}" width="${noteSize}" height="${noteSize}" fill="${SHADOW}"/>
        <rect x="${nx}" y="${ny}" width="${noteSize}" height="${noteSize}" fill="${bgColor}"/>
        ${content}
      </g>`;
    };

    const notePadX = 18;
    const noteInnerLeft = (offsetX: number) => cx - noteSize / 2 + offsetX + notePadX;
    const noteInnerW = noteSize - notePadX * 2;

    // Bottom note (yellow)
    const yellowOffsetX = -16;
    const yellowOffsetY = -10;
    const yellowLeft = noteInnerLeft(yellowOffsetX);
    const yellowTop = cy - noteSize / 2 + yellowOffsetY + notePadX;
    let yy = yellowTop;
    const datePath = textPath(todayISO(), 'serif-italic', 11, yellowLeft, yy + 6, 'left', 'middle');
    yy += 24;
    const fromHeaderText = `— from ${data.originLanguage ?? 'unknown'} —`;
    const fromHeaderSize = fitFontSize(fromHeaderText, 'serif-italic', noteInnerW, 14, 10);
    const fromHeaderPath = textPath(fromHeaderText, 'serif-italic', fromHeaderSize, yellowLeft, yy, 'left', 'middle');
    yy += 26;
    const etymText = data.etymology ? truncate(data.etymology, 110) : truncate(data.definition, 110);
    const etymLines = wrapText(etymText, 22).slice(0, 6);
    const etymPaths = etymLines.map((line, i) => {
      const lineSize = fitFontSize(line, 'serif-italic', noteInnerW, 13, 10);
      const p = textPath(line, 'serif-italic', lineSize, yellowLeft, yy + i * 18, 'left', 'middle');
      return `<path d="${p}" fill="${INK}"/>`;
    });

    const yellowContent = `
      <path d="${datePath}" fill="${META}"/>
      <path d="${fromHeaderPath}" fill="${INK}"/>
      ${etymPaths.join('\n')}
    `;

    // Middle note (green)
    const greenOffsetX = 12;
    const greenOffsetY = 6;
    const greenLeft = noteInnerLeft(greenOffsetX);
    const greenTop = cy - noteSize / 2 + greenOffsetY + notePadX;
    let gy = greenTop + 6;
    const greenSubText = `${data.partOfSpeech || 'word'} · /${data.ipa ?? '—'}/`;
    const greenSubSize = fitFontSize(greenSubText, 'serif-italic', noteInnerW, 13, 10);
    const greenSubPath = textPath(greenSubText, 'serif-italic', greenSubSize, greenLeft, gy, 'left', 'middle');
    gy += 26;
    const defText = data.definition;
    const defLines = wrapText(defText, 22).slice(0, 6);
    const defPaths = defLines.map((line, i) => {
      const lineSize = fitFontSize(line, 'serif-italic', noteInnerW, 13, 10);
      const p = textPath(line, 'serif-italic', lineSize, greenLeft, gy + i * 18, 'left', 'middle');
      return `<path d="${p}" fill="${INK}"/>`;
    });
    const stars = rarityStars(data.word);
    const starText = `${starGlyphs(stars)} #${entryNumber(data.word)}`;
    const starY = cy + noteSize / 2 + greenOffsetY - notePadX - 6;
    const starX = cx + noteSize / 2 + greenOffsetX - notePadX;
    const starPath = textPath(starText, 'serif-italic', 11, starX, starY, 'right', 'middle');

    const greenContent = `
      <path d="${greenSubPath}" fill="${INK}"/>
      ${defPaths.join('\n')}
      <path d="${starPath}" fill="${META}"/>
    `;

    // Top note (pink)
    const pinkOffsetX = 0;
    const pinkOffsetY = 0;
    const pinkLeft = noteInnerLeft(pinkOffsetX);
    const pinkRight = cx + noteSize / 2 - notePadX;
    const pinkTop = cy - noteSize / 2 + notePadX;
    const pinkCx = cx;

    let py = pinkTop + 8;
    const pinkHeaderPath = textPath('word of today!', 'serif-italic', 14, pinkCx, py, 'center', 'middle');
    py += 36;
    const pinkWordSize = fitFontSize(data.word, 'serif-italic', noteInnerW, 30, 16);
    const pinkWordPath = textPath(data.word, 'serif-italic', pinkWordSize, pinkCx, py + pinkWordSize / 2 - 4, 'center', 'middle');
    py += pinkWordSize + 10;
    const pinkRuleY = py;
    const pinkRuleW = noteInnerW * 0.4;
    const pinkRule = `<line x1="${pinkCx - pinkRuleW / 2}" y1="${pinkRuleY}" x2="${pinkCx + pinkRuleW / 2}" y2="${pinkRuleY}" stroke="${INK}" stroke-width="0.5"/>`;
    py += 22;
    const pinkDefText = truncate(data.definition, 50);
    const pinkDefLines = wrapText(pinkDefText, 22).slice(0, 2);
    const pinkDefPaths = pinkDefLines.map((line, i) => {
      const lineSize = fitFontSize(line, 'serif-italic', noteInnerW, 13, 10);
      const p = textPath(line, 'serif-italic', lineSize, pinkCx, py + i * 18, 'center', 'middle');
      return `<path d="${p}" fill="${INK}"/>`;
    });
    const pinkWatermarkY = cy + noteSize / 2 - notePadX - 6;
    const pinkWatermarkPath = textPath(watermark, 'mono', 9, pinkCx, pinkWatermarkY, 'center', 'middle');

    const pinkContent = `
      <path d="${pinkHeaderPath}" fill="${META}"/>
      <path d="${pinkWordPath}" fill="${INK}"/>
      ${pinkRule}
      ${pinkDefPaths.join('\n')}
      <path d="${pinkWatermarkPath}" fill="${META}"/>
    `;

    void pinkLeft; void pinkRight;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        ${buildNote(YELLOW, -6, yellowOffsetX, yellowOffsetY, yellowContent)}
        ${buildNote(GREEN, 3, greenOffsetX, greenOffsetY, greenContent)}
        ${buildNote(PINK, -1, pinkOffsetX, pinkOffsetY, pinkContent)}
      </svg>
    `;
  },
};
