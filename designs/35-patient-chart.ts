import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { approxSyllables, entryNumber, extractCentury, rarityStars, wrapText } from './utils';

const BG = '#e0e8e0';
const STRIP = '#2a4a2a';
const STRIP_TEXT = '#e0e8e0';
const INK = '#1a2a1a';
const LABEL = '#5a7a5a';
const RED = '#c44d3c';
const GREEN_OK = '#2a8a4a';
const RULE = '#5a7a5a';
const ETYM = '#2a3a2a';

export const patientChart: Design = {
  name: 'patient-chart',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const stripH = 44;
    const padX = 28;
    const innerLeft = padX;
    const innerRight = width - padX;
    const innerW = innerRight - innerLeft;

    const headerLeft = textPath('+ PATIENT CHART', 'mono', 13, innerLeft, stripH / 2, 'left', 'middle');
    const headerRight = textPath(`RM ${entryNumber(data.word)}`, 'mono', 11, innerRight, stripH / 2, 'right', 'middle');

    let y = stripH + 30;

    const patientLabelPath = textPath('PATIENT NAME', 'mono', 11, innerLeft, y, 'left', 'middle');
    y += 30;

    const wordSize = fitFontSize(data.word, 'sans-bold', innerW, 38, 20);
    const wordPath = textPath(data.word, 'sans-bold', wordSize, innerLeft, y, 'left', 'middle');
    y += wordSize / 2 + 18;

    const metaText = `${data.word.length} LETTERS · ${approxSyllables(data.word)} SYLLABLES${data.ipa ? ` · /${data.ipa}/` : ''}`;
    const metaSize = fitFontSize(metaText, 'mono', innerW, 11, 9);
    const metaPath = textPath(metaText, 'mono', metaSize, innerLeft, y, 'left', 'middle');
    y += 26;

    const ruleA = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${RULE}" stroke-width="0.5"/>`;
    y += 22;

    const labelW = 90;
    const valueX = innerLeft + labelW;
    const rowH = 22;
    const rarity = rarityStars(data.word);
    const usageText = rarity >= 4 ? 'RARE — monitor closely' : rarity <= 2 ? 'COMMON' : 'MODERATE';
    const usageColor = rarity >= 4 ? RED : rarity <= 2 ? GREEN_OK : INK;

    const rows: Array<{ label: string; value: string; color: string }> = [
      { label: 'CLASS', value: data.partOfSpeech ? `${data.partOfSpeech} (${data.partOfSpeech.charAt(0).toLowerCase()}.)` : '—', color: INK },
      { label: 'ORIGIN', value: `${data.originLanguage ?? '—'}${data.etymology && extractCentury(data.etymology) ? ` · ${extractCentury(data.etymology)}` : ''}`, color: INK },
      { label: 'USAGE', value: usageText, color: usageColor },
    ];
    const rowPaths = rows.flatMap((row) => {
      const lp = textPath(row.label, 'mono', 11, innerLeft, y, 'left', 'middle');
      const valueSize = fitFontSize(row.value, 'mono', innerRight - valueX, 11, 9);
      const vp = textPath(row.value, 'mono', valueSize, valueX, y, 'left', 'middle');
      y += rowH;
      return [
        `<path d="${lp}" fill="${LABEL}"/>`,
        `<path d="${vp}" fill="${row.color}"/>`,
      ];
    });

    y += 4;
    const ruleB = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${RULE}" stroke-width="0.5"/>`;
    y += 22;

    const diagLabelPath = textPath('DIAGNOSIS', 'mono', 11, innerLeft, y, 'left', 'middle');
    y += 22;
    const diagLines = wrapText(data.definition, 44).slice(0, 3);
    const diagPaths = diagLines.map((line) => {
      const size = fitFontSize(line, 'sans-bold', innerW, 14, 11);
      const p = textPath(line, 'sans-bold', size, innerLeft, y, 'left', 'middle');
      y += 22;
      return `<path d="${p}" fill="${INK}"/>`;
    });
    y += 8;

    let etymPaths: string[] = [];
    const etymLabelY = y;
    const etymLabelPath = textPath('ETYMOLOGY', 'mono', 11, innerLeft, etymLabelY, 'left', 'middle');
    y += 22;
    const etymText = data.etymology ?? '—';
    const etymLines = wrapText(etymText, 48).slice(0, 2);
    etymPaths = etymLines.map((line) => {
      const size = fitFontSize(line, 'sans-bold', innerW, 12, 10);
      const p = textPath(line, 'sans-bold', size, innerLeft, y, 'left', 'middle');
      y += 20;
      return `<path d="${p}" fill="${ETYM}"/>`;
    });

    const footerLeft = textPath('DR. EWB', 'mono', 11, innerLeft, height - stripH / 2, 'left', 'middle');
    const footerRight = textPath(watermark.toUpperCase(), 'mono', 11, innerRight, height - stripH / 2, 'right', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <rect x="0" y="0" width="${width}" height="${stripH}" fill="${STRIP}"/>
        <path d="${headerLeft}" fill="${STRIP_TEXT}"/>
        <path d="${headerRight}" fill="${STRIP_TEXT}" fill-opacity="0.7"/>
        <path d="${patientLabelPath}" fill="${LABEL}"/>
        <path d="${wordPath}" fill="${INK}"/>
        <path d="${metaPath}" fill="${LABEL}"/>
        ${ruleA}
        ${rowPaths.join('\n')}
        ${ruleB}
        <path d="${diagLabelPath}" fill="${LABEL}"/>
        ${diagPaths.join('\n')}
        <path d="${etymLabelPath}" fill="${LABEL}"/>
        ${etymPaths.join('\n')}
        <rect x="0" y="${height - stripH}" width="${width}" height="${stripH}" fill="${STRIP}"/>
        <path d="${footerLeft}" fill="${STRIP_TEXT}"/>
        <path d="${footerRight}" fill="${STRIP_TEXT}"/>
      </svg>
    `;
  },
};
