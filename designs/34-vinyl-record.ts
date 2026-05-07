import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, extractCentury, truncate } from './utils';

const BG = '#1a1a1a';
const VINYL_DARK = '#0a0a0a';
const VINYL_GROOVE = '#2a2a2a';
const LABEL_RED = '#c44d3c';
const LABEL_TEXT = '#f4ead0';
const TEXT = '#f4ead0';
const ACCENT = '#c44d3c';
const SOFT = '#a8a098';
const TRACK = '#d4c8a8';
const DIM = '#5a4a3a';

export const vinylRecord: Design = {
  name: 'vinyl-record',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const padX = 28;
    const recordSize = Math.min(width * 0.42, height * 0.85);
    const recordCx = padX + recordSize / 2;
    const recordCy = height / 2;
    const recordR = recordSize / 2;
    const labelR = recordR * 0.42;
    const spindleR = labelR * 0.18;

    const grooveCircles: string[] = [];
    grooveCircles.push(`<circle cx="${recordCx}" cy="${recordCy}" r="${recordR}" fill="${VINYL_DARK}"/>`);
    const grooveCount = 8;
    for (let i = 1; i <= grooveCount; i++) {
      const r = labelR + (recordR - labelR) * (i / (grooveCount + 1));
      const stroke = i % 2 === 0 ? VINYL_GROOVE : '#1f1f1f';
      grooveCircles.push(`<circle cx="${recordCx}" cy="${recordCy}" r="${r}" fill="none" stroke="${stroke}" stroke-width="1" stroke-opacity="0.7"/>`);
    }
    const labelCircle = `<circle cx="${recordCx}" cy="${recordCy}" r="${labelR}" fill="${LABEL_RED}"/>`;
    const spindleCircle = `<circle cx="${recordCx}" cy="${recordCy}" r="${spindleR}" fill="${VINYL_DARK}"/>`;

    const sideLabelY = recordCy - labelR * 0.7;
    const sideLabelPath = textPath('SIDE A', 'mono', Math.max(8, labelR * 0.13), recordCx, sideLabelY, 'center', 'middle');

    const labelTextMaxW = labelR * 1.5;
    const labelWordSize = fitFontSize(data.word, 'serif-italic', labelTextMaxW, Math.max(10, labelR * 0.22), 7);
    const labelWordY = recordCy - labelR * 0.42;
    const labelWordPath = textPath(data.word, 'serif-italic', labelWordSize, recordCx, labelWordY, 'center', 'middle');

    const rightX = padX + recordSize + 24;
    const rightW = width - rightX - padX;
    let y = padX + 36;

    const labelPath = textPath(`EWB RECORDS · LP·${entryNumber(data.word)}`, 'mono', 11, rightX, y, 'left', 'middle');
    y += 36;

    const wordSize = fitFontSize(data.word, 'serif-italic', rightW, 30, 18);
    const wordPath = textPath(data.word, 'serif-italic', wordSize, rightX, y, 'left', 'middle');
    y += wordSize / 2 + 18;

    const subText = `${data.partOfSpeech || '—'}${data.ipa ? ` · /${data.ipa}/` : ''}`;
    const subSize = fitFontSize(subText, 'mono', rightW, 12, 9);
    const subPath = textPath(subText, 'mono', subSize, rightX, y, 'left', 'middle');
    y += 24;

    const ruleY = y;
    y += 22;

    const tracklistLabel = textPath('TRACKLIST', 'mono', 11, rightX, y, 'left', 'middle');
    y += 24;

    const tracks = data.definition.split(/[,;]|\s+(?:or|and)\s+/).map(s => s.trim()).filter(Boolean).slice(0, 2);
    const trackPaths: string[] = [];
    tracks.forEach((track, i) => {
      const trackText = `${i + 1}. ${truncate(track, 30)}`;
      const trackSize = fitFontSize(trackText, 'serif', rightW, 13, 10);
      const p = textPath(trackText, 'serif', trackSize, rightX, y, 'left', 'middle');
      trackPaths.push(`<path d="${p}" fill="${TRACK}"/>`);
      y += 22;
    });

    if (data.etymology) {
      const etymTrack = `${tracks.length + 1}. (b-side) ${truncate(data.etymology.replace(/^From\s+/i, 'from '), 30)}`;
      const etymSize = fitFontSize(etymTrack, 'serif-italic', rightW, 12, 9);
      const p = textPath(etymTrack, 'serif-italic', etymSize, rightX, y, 'left', 'middle');
      trackPaths.push(`<path d="${p}" fill="${SOFT}"/>`);
      y += 22;
    }

    const copyrightY = height - padX - 8;
    const copyText = `(P) ENGLISHWORDBOT  ${extractCentury(data.etymology) ?? ''}`.trim();
    const copyPath = textPath(copyText, 'mono', 9, rightX, copyrightY, 'left', 'middle');

    const watermarkPath = textPath(watermark, 'mono', 9, width - padX, copyrightY, 'right', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        ${grooveCircles.join('\n')}
        ${labelCircle}
        <path d="${sideLabelPath}" fill="${LABEL_TEXT}" fill-opacity="0.85"/>
        <path d="${labelWordPath}" fill="${LABEL_TEXT}"/>
        ${spindleCircle}
        <path d="${labelPath}" fill="${ACCENT}"/>
        <path d="${wordPath}" fill="${TEXT}"/>
        <path d="${subPath}" fill="${SOFT}"/>
        <line x1="${rightX}" y1="${ruleY}" x2="${rightX + rightW}" y2="${ruleY}" stroke="${DIM}" stroke-width="0.5"/>
        <path d="${tracklistLabel}" fill="${SOFT}"/>
        ${trackPaths.join('\n')}
        <path d="${copyPath}" fill="${DIM}"/>
        <path d="${watermarkPath}" fill="${DIM}"/>
      </svg>
    `;
  },
};
