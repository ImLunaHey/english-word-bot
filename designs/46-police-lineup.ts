import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { approxSyllables, entryNumber, extractCentury, todayISO, truncate } from './utils';

const BG = '#e8e8e8';
const INK = '#1a1a1a';
const SOFT = '#555555';
const PANEL_BG = '#2a2a2a';
const PANEL_LABEL = '#999999';
const PANEL_TEXT = '#f5f3ec';
const PANEL_SOFT = '#c8c8c8';
const NUMBER_PLATE = '#ffffff';
const RED = '#c44d3c';

export const policeLineup: Design = {
  name: 'police-lineup',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const padX = 28;
    const innerLeft = padX;
    const innerRight = width - padX;
    const innerW = innerRight - innerLeft;

    let y = 32;
    const titlePath = textPath(`| LEXICON LINEUP NO.${entryNumber(data.word)}`, 'mono', 12, innerLeft, y, 'left', 'middle');
    const datePath = textPath(`14:20 · ${todayISO().replace(/-/g, '·')}`, 'mono', 10, innerRight, y, 'right', 'middle');
    y += 16;
    const headerRule = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${INK}" stroke-width="2"/>`;
    y += 24;

    const panelX = innerLeft;
    const panelY = y;
    const panelW = innerW;
    const panelPadX = 16;
    let py = panelY + 22;

    const suspectLabel = textPath('SUSPECT', 'mono', 10, panelX + panelW / 2, py, 'center', 'middle');
    py += 28;

    const wordSize = fitFontSize(data.word, 'sans-bold', panelW - panelPadX * 2, 38, 20);
    const wordPath = textPath(data.word, 'sans-bold', wordSize, panelX + panelW / 2, py, 'center', 'middle');
    py += wordSize / 2 + 18;

    const statsText = `HEIGHT · ${data.word.length} CH      WEIGHT · ${approxSyllables(data.word)} SYL      CLASS · ${(data.partOfSpeech || 'WORD').toUpperCase()}`;
    const statsSize = fitFontSize(statsText, 'mono', panelW - panelPadX * 2, 11, 8);
    const statsPath = textPath(statsText, 'mono', statsSize, panelX + panelW / 2, py, 'center', 'middle');
    py += 28;

    const plateText = entryNumber(data.word).split('').join(' ');
    const plateW = 130;
    const plateH = 32;
    const plateX = panelX + panelW / 2 - plateW / 2;
    const plateY = py - plateH / 2;
    const plateRect = `<rect x="${plateX}" y="${plateY}" width="${plateW}" height="${plateH}" fill="${NUMBER_PLATE}"/>`;
    const platePath = textPath(plateText, 'sans-bold', 16, panelX + panelW / 2, py, 'center', 'middle');
    py += 32;

    const footMarkers = ['1FT', '2FT', '3FT', '4FT', '5FT', '6FT'];
    const footY = py;
    const footPaths: string[] = [];
    const footStart = panelX + panelPadX + 20;
    const footEnd = panelX + panelW - panelPadX - 20;
    footMarkers.forEach((mk, i) => {
      const fx = footStart + ((footEnd - footStart) / (footMarkers.length - 1)) * i;
      const fp = textPath(mk, 'mono', 9, fx, footY, 'center', 'middle');
      footPaths.push(`<path d="${fp}" fill="${PANEL_LABEL}"/>`);
    });
    py += 22;

    const panelH = py - panelY;
    const panelRect = `<rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" fill="${PANEL_BG}"/>`;
    y = panelY + panelH + 18;

    const labelW = 100;
    const valueX = innerLeft + labelW;
    const rowH = 22;
    const rows: Array<{ label: string; value: string; color: string; family: 'mono' | 'serif-italic' }> = [
      { label: 'A.K.A.', value: data.ipa ? `/${data.ipa}/` : '—', color: INK, family: 'mono' },
      { label: 'CHARGES', value: truncate(data.definition, 50).toUpperCase(), color: RED, family: 'mono' },
      { label: 'LAST SEEN', value: `${(data.originLanguage ?? 'UNKNOWN').toUpperCase()}, ${extractCentury(data.etymology) ?? '—'}`, color: INK, family: 'mono' },
      { label: 'M.O.', value: `"${data.etymology ? truncate(data.etymology, 32) : '—'}"`, color: INK, family: 'mono' },
    ];
    const rowPaths = rows.flatMap((row) => {
      const lp = textPath(row.label, 'mono', 10, innerLeft, y, 'left', 'middle');
      const valueSize = fitFontSize(row.value, row.family, innerRight - valueX, 11, 8);
      const vp = textPath(row.value, row.family, valueSize, valueX, y, 'left', 'middle');
      y += rowH;
      return [
        `<path d="${lp}" fill="${SOFT}"/>`,
        `<path d="${vp}" fill="${row.color}"/>`,
      ];
    });

    const footerY = height - 28;
    const footerRule = `<line x1="${innerLeft}" y1="${footerY - 14}" x2="${innerRight}" y2="${footerY - 14}" stroke="${INK}" stroke-width="2"/>`;
    const footerLeft = textPath('OFFICER · EWB', 'mono', 10, innerLeft, footerY, 'left', 'middle');
    const footerRight = textPath(watermark.toUpperCase(), 'mono', 10, innerRight, footerY, 'right', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <path d="${titlePath}" fill="${INK}"/>
        <path d="${datePath}" fill="${SOFT}"/>
        ${headerRule}
        ${panelRect}
        <path d="${suspectLabel}" fill="${PANEL_LABEL}"/>
        <path d="${wordPath}" fill="${PANEL_TEXT}"/>
        <path d="${statsPath}" fill="${PANEL_SOFT}"/>
        ${plateRect}
        <path d="${platePath}" fill="${INK}"/>
        ${footPaths.join('\n')}
        ${rowPaths.join('\n')}
        ${footerRule}
        <path d="${footerLeft}" fill="${SOFT}"/>
        <path d="${footerRight}" fill="${SOFT}"/>
      </svg>
    `;
  },
};
