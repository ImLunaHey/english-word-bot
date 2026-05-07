import type { Design } from './types';
import { textPath, fitFontSize, measureText } from './fonts';
import { entryNumber, extractCentury, hash, posAbbrev, todayISO, wrapText } from './utils';
import { splitMorphemesDetailed } from './morphemes';

const BG = '#e8edf0';
const INK = '#1a2a3a';
const SOFT = '#5a6a7a';
const RULE_HEAVY = '#1a2a3a';
const RULE = '#5a6a7a';

const COLOR_PREFIX_BG = '#d4a574';
const COLOR_PREFIX_FG = '#4a2a0a';
const COLOR_ROOT_BG = '#a8c8d4';
const COLOR_ROOT_FG = '#1a3a4a';
const COLOR_SUFFIX_BG = '#c8a8d4';
const COLOR_SUFFIX_FG = '#3a1a4a';
const COLOR_FALLBACK_BG = '#c0c8d0';
const COLOR_FALLBACK_FG = '#1a2a3a';

export const labReport: Design = {
  name: 'lab-report',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const padX = 28;
    const innerLeft = padX;
    const innerRight = width - padX;
    const innerW = innerRight - innerLeft;

    let y = 30;
    const titlePath = textPath('LAB REPORT', 'mono', 15, innerLeft, y, 'left', 'middle');
    const sampleIdPath = textPath(`SAMPLE ID: ${entryNumber(data.word)}`, 'mono', 10, innerRight, y, 'right', 'middle');
    y += 16;
    const subTitlePath = textPath('DEPT. OF LEXICAL CHEMISTRY', 'mono', 10, innerLeft, y, 'left', 'middle');
    const datePath = textPath(todayISO().replace(/-/g, '·'), 'mono', 10, innerRight, y, 'right', 'middle');
    y += 14;
    const ruleA = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${RULE_HEAVY}" stroke-width="2"/>`;
    y += 24;

    const sampleLabel = textPath('SAMPLE', 'mono', 10, innerLeft, y, 'left', 'middle');
    y += 22;
    const wordSize = fitFontSize(data.word, 'sans-bold', innerW, 32, 18);
    const wordPath = textPath(data.word, 'sans-bold', wordSize, innerLeft, y, 'left', 'middle');
    y += wordSize / 2 + 16;
    const formula = `C${data.word.length}H0-${data.partOfSpeech || 'word'}${data.ipa ? ` · /${data.ipa}/` : ''}`;
    const formulaSize = fitFontSize(formula, 'mono', innerW, 11, 8);
    const formulaPath = textPath(formula, 'mono', formulaSize, innerLeft, y, 'left', 'middle');
    y += 30;

    const compositionLabelPath = textPath('COMPOSITION', 'mono', 10, innerLeft, y, 'left', 'middle');
    y += 18;

    const morphemes = splitMorphemesDetailed(data.word);
    const totalLen = morphemes.reduce((a, m) => a + m.segment.length, 0);
    const barH = 32;
    const barY = y;
    const barOut: string[] = [];
    let cursor = innerLeft;
    morphemes.forEach((m) => {
      const segW = (m.segment.length / totalLen) * innerW;
      const pct = Math.round((m.segment.length / totalLen) * 100);
      const colorBg = m.kind === 'prefix' ? COLOR_PREFIX_BG : m.kind === 'suffix' ? COLOR_SUFFIX_BG : (morphemes.length === 1 ? COLOR_FALLBACK_BG : COLOR_ROOT_BG);
      const colorFg = m.kind === 'prefix' ? COLOR_PREFIX_FG : m.kind === 'suffix' ? COLOR_SUFFIX_FG : (morphemes.length === 1 ? COLOR_FALLBACK_FG : COLOR_ROOT_FG);
      barOut.push(`<rect x="${cursor}" y="${barY}" width="${segW}" height="${barH}" fill="${colorBg}"/>`);
      const labelText = `${m.segment.toUpperCase()} · ${pct}%`;
      const labelSize = fitFontSize(labelText, 'sans-bold', segW - 6, 11, 7);
      const lp = textPath(labelText, 'sans-bold', labelSize, cursor + segW / 2, barY + barH / 2, 'center', 'middle');
      barOut.push(`<path d="${lp}" fill="${colorFg}"/>`);
      cursor += segW;
    });
    y += barH + 8;

    cursor = innerLeft;
    const glossOut: string[] = [];
    morphemes.forEach((m) => {
      const segW = (m.segment.length / totalLen) * innerW;
      const glossText = m.gloss ? `${m.kind} · "${m.gloss}"` : m.kind;
      const glossSize = fitFontSize(glossText, 'mono', segW - 6, 9, 7);
      const gp = textPath(glossText, 'mono', glossSize, cursor + segW / 2, y, 'center', 'middle');
      glossOut.push(`<path d="${gp}" fill="${SOFT}"/>`);
      cursor += segW;
    });
    y += 28;

    const resultsLabel = textPath('RESULTS', 'mono', 10, innerLeft, y, 'left', 'middle');
    y += 22;
    const resultsLines = wrapText(data.definition, 56).slice(0, 2);
    const resultsPaths = resultsLines.map((line) => {
      const lineSize = fitFontSize(line, 'sans-bold', innerW, 13, 10);
      const p = textPath(line, 'sans-bold', lineSize, innerLeft, y, 'left', 'middle');
      y += 20;
      return `<path d="${p}" fill="${INK}"/>`;
    });
    y += 12;

    const ruleB = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${RULE}" stroke-width="0.5"/>`;
    y += 18;

    const purityPct = `99.${hash(data.word) % 9}%`;
    const labelW = 90;
    const valueX = innerLeft + labelW;
    const rows: Array<[string, string, string]> = [
      ['ORIGIN', `${data.originLanguage ?? '—'}${extractCentury(data.etymology) ? ` · ${extractCentury(data.etymology)}` : ''}`, INK],
      ['PURITY', `${data.partOfSpeech ? posAbbrev(data.partOfSpeech) : 'word'}, ${purityPct}`, INK],
      ['SIGNED', '— englishwordbot', INK],
    ];
    const rowPaths = rows.flatMap(([label, value, color]) => {
      const lp = textPath(label, 'mono', 10, innerLeft, y, 'left', 'middle');
      const valueFamily = label === 'SIGNED' ? 'serif-italic' : 'mono';
      const valueSize = fitFontSize(value, valueFamily, innerRight - valueX, 11, 9);
      const vp = textPath(value, valueFamily, valueSize, valueX, y, 'left', 'middle');
      y += 20;
      return [
        `<path d="${lp}" fill="${SOFT}"/>`,
        `<path d="${vp}" fill="${color}"/>`,
      ];
    });

    const watermarkPath = textPath(watermark, 'mono', 10, width / 2, height - 16, 'center', 'middle');

    void measureText;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <path d="${titlePath}" fill="${INK}"/>
        <path d="${sampleIdPath}" fill="${SOFT}"/>
        <path d="${subTitlePath}" fill="${SOFT}"/>
        <path d="${datePath}" fill="${SOFT}"/>
        ${ruleA}
        <path d="${sampleLabel}" fill="${SOFT}"/>
        <path d="${wordPath}" fill="${INK}"/>
        <path d="${formulaPath}" fill="${SOFT}"/>
        <path d="${compositionLabelPath}" fill="${SOFT}"/>
        ${barOut.join('\n')}
        ${glossOut.join('\n')}
        <path d="${resultsLabel}" fill="${SOFT}"/>
        ${resultsPaths.join('\n')}
        ${ruleB}
        ${rowPaths.join('\n')}
        <path d="${watermarkPath}" fill="${SOFT}"/>
      </svg>
    `;
  },
};
