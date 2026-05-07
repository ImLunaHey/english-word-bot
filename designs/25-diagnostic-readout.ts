import type { Design } from './types';
import { textPath, measureText } from './fonts';
import { approxSyllables, truncate } from './utils';
import { splitMorphemesDetailed } from './morphemes';

const BG = '#0a1a14';
const GREEN = '#6affb0';
const DIM = '#4a7a5a';
const TEXT = '#f4f4f0';
const SOFT = '#c8d4c0';
const HIGHLIGHT = '#f4c478';
const RULE = '#1a3a2a';

export const diagnosticReadout: Design = {
  name: 'diagnostic-readout',
  canRender: () => true,
  render: ({ data, watermark, width, height }) => {
    const padX = 28;
    const headerY = 36;
    const lineH = 24;
    const fontSize = 14;
    const labelSize = 13;

    const headerPath = textPath('| WORD DIAGNOSTIC v0.4.28', 'mono', labelSize, padX, headerY, 'left', 'middle');
    const timePath = textPath('14:20:07', 'mono', labelSize, width - padX, headerY, 'right', 'middle');

    let y = headerY + 32;
    const out: string[] = [];
    const emit = (text: string, color: string, indent = 0) => {
      const p = textPath(text, 'mono', fontSize, padX + indent, y, 'left', 'middle');
      out.push(`<path d="${p}" fill="${color}"/>`);
      y += lineH;
    };
    const space = (n = 1) => { y += lineH * (n - 1) + 8; };

    emit('[ scanning ]', DIM);

    {
      const prefix = '>TARGET: ';
      const prefixW = measureText(prefix, 'mono', fontSize).width;
      const pp = textPath(prefix, 'mono', fontSize, padX, y, 'left', 'middle');
      const wp = textPath(data.word, 'mono', fontSize, padX + prefixW, y, 'left', 'middle');
      out.push(`<path d="${pp}" fill="${TEXT}"/>`);
      out.push(`<path d="${wp}" fill="${GREEN}"/>`);
      y += lineH;
    }
    emit(`  └─ length......${data.word.length} chars`, DIM);
    emit(`  └─ syllables...${approxSyllables(data.word)}`, DIM);
    space();

    if (data.ipa) {
      const prefix = '>PHONETIC: ';
      const prefixW = measureText(prefix, 'mono', fontSize).width;
      const pp = textPath(prefix, 'mono', fontSize, padX, y, 'left', 'middle');
      const ipa = `/${data.ipa}/`;
      const ipaPath = textPath(ipa, 'mono', fontSize, padX + prefixW, y, 'left', 'middle');
      out.push(`<path d="${pp}" fill="${TEXT}"/>`);
      out.push(`<path d="${ipaPath}" fill="${HIGHLIGHT}"/>`);
      y += lineH;
      space();
    }

    const morphemes = splitMorphemesDetailed(data.word);
    if (morphemes.length > 1) {
      emit('>MORPHOLOGY:', TEXT);
      morphemes.forEach((m, i) => {
        const isLast = i === morphemes.length - 1;
        const connector = isLast ? '  └─ ' : '  ├─ ';
        const connectorW = measureText(connector, 'mono', fontSize).width;
        const segLabel = m.segment;
        const segLabelW = measureText(segLabel, 'mono', fontSize).width;
        const dots = '......';
        const meta = `${m.kind}${m.gloss ? ` · "${m.gloss}"` : ''}`;

        const cp = textPath(connector, 'mono', fontSize, padX, y, 'left', 'middle');
        const sp = textPath(segLabel, 'mono', fontSize, padX + connectorW, y, 'left', 'middle');
        const dp = textPath(dots, 'mono', fontSize, padX + connectorW + segLabelW, y, 'left', 'middle');
        const mp = textPath(meta, 'mono', fontSize, padX + connectorW + segLabelW + measureText(dots, 'mono', fontSize).width + 6, y, 'left', 'middle');

        out.push(`<path d="${cp}" fill="${DIM}"/>`);
        out.push(`<path d="${sp}" fill="${HIGHLIGHT}"/>`);
        out.push(`<path d="${dp}" fill="${DIM}"/>`);
        out.push(`<path d="${mp}" fill="${DIM}"/>`);
        y += lineH;
      });
      space();
    }

    if (data.partOfSpeech) {
      const prefix = '>CLASS: ';
      const prefixW = measureText(prefix, 'mono', fontSize).width;
      const pp = textPath(prefix, 'mono', fontSize, padX, y, 'left', 'middle');
      const vp = textPath(data.partOfSpeech, 'mono', fontSize, padX + prefixW, y, 'left', 'middle');
      out.push(`<path d="${pp}" fill="${TEXT}"/>`);
      out.push(`<path d="${vp}" fill="${GREEN}"/>`);
      y += lineH;
    }

    if (data.definition) {
      const prefix = '>DEF: ';
      const prefixW = measureText(prefix, 'mono', fontSize).width;
      const def = truncate(data.definition, 56);
      const pp = textPath(prefix, 'mono', fontSize, padX, y, 'left', 'middle');
      const vp = textPath(def, 'mono', fontSize, padX + prefixW, y, 'left', 'middle');
      out.push(`<path d="${pp}" fill="${TEXT}"/>`);
      out.push(`<path d="${vp}" fill="${SOFT}"/>`);
      y += lineH;
    }

    if (data.originLanguage) {
      const prefix = '>ORIGIN: ';
      const prefixW = measureText(prefix, 'mono', fontSize).width;
      const pp = textPath(prefix, 'mono', fontSize, padX, y, 'left', 'middle');
      const vp = textPath(data.originLanguage, 'mono', fontSize, padX + prefixW, y, 'left', 'middle');
      out.push(`<path d="${pp}" fill="${TEXT}"/>`);
      out.push(`<path d="${vp}" fill="${GREEN}"/>`);
      y += lineH;
    }

    space(2);
    emit('[ analysis complete ]', DIM);

    const cursorPrefix = '| ';
    const cursorPrefixW = measureText(cursorPrefix, 'mono', fontSize).width;
    const cpp = textPath(cursorPrefix, 'mono', fontSize, padX, y, 'left', 'middle');
    out.push(`<path d="${cpp}" fill="${DIM}"/>`);
    const cursorRect = `<rect x="${padX + cursorPrefixW}" y="${y - fontSize * 0.55}" width="${fontSize * 0.45}" height="${fontSize}" fill="${GREEN}"/>`;

    const watermarkPath = textPath(watermark, 'mono', 11, width - padX, height - 24, 'right', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <path d="${headerPath}" fill="${GREEN}"/>
        <path d="${timePath}" fill="${DIM}"/>
        <line x1="${padX}" y1="${headerY + 16}" x2="${width - padX}" y2="${headerY + 16}" stroke="${RULE}" stroke-width="1"/>
        ${out.join('\n')}
        ${cursorRect}
        <path d="${watermarkPath}" fill="${DIM}"/>
      </svg>
    `;
  },
};
