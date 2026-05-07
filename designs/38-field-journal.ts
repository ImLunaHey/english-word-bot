import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, truncate, wrapText } from './utils';

const PAPER = '#e8dfc4';
const INK = '#2a1a0a';
const META = '#5a4a2a';
const ETYM_INK = '#4a2a1a';

export const fieldJournal: Design = {
  name: 'field-journal',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const padX = 36;
    const innerLeft = padX;
    const innerRight = width - padX;
    const innerW = innerRight - innerLeft;

    const ruleSpacing = 28;
    const rulesStartY = 60;
    const rules: string[] = [];
    for (let yy = rulesStartY; yy < height - 40; yy += ruleSpacing) {
      rules.push(`<line x1="${innerLeft}" y1="${yy}" x2="${innerRight}" y2="${yy}" stroke="${META}" stroke-opacity="0.12" stroke-width="0.7"/>`);
    }

    let y = 36;
    const headerLeft = textPath('FIELD JOURNAL', 'mono', 11, innerLeft, y, 'left', 'middle');
    const headerRight = textPath(`VOL III · ENTRY ${entryNumber(data.word)}`, 'mono', 11, innerRight, y, 'right', 'middle');
    y += 16;
    const headerRule = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${META}" stroke-width="1"/>`;
    y += 30;

    const introPath = textPath('Spotted today, in the wild —', 'serif-italic', 13, innerLeft, y, 'left', 'middle');
    y += 30;

    const wordSize = fitFontSize(data.word, 'serif-italic', innerW, 38, 20);
    const wordPath = textPath(data.word, 'serif-italic', wordSize, innerLeft, y, 'left', 'middle');
    y += wordSize / 2 + 18;

    const ipaText = `${data.partOfSpeech ? `${data.partOfSpeech.charAt(0).toLowerCase()}.` : ''}${data.ipa ? `${data.partOfSpeech ? ' · ' : ''}/${data.ipa}/` : ''}` || '—';
    const ipaPath = textPath(ipaText, 'mono', 11, innerLeft, y, 'left', 'middle');
    y += 26;

    const sentenceEnd = data.definition.search(/[.!?](\s|$)/);
    const firstSentence = sentenceEnd > 0 ? data.definition.slice(0, sentenceEnd + 1) : data.definition;
    const habitatNote = ` Observed chiefly among ${data.originLanguage ?? 'unknown'} species; rare in modern English habitats.`;
    const observation = `${firstSentence}${habitatNote}`;
    const obsLines = wrapText(observation, 56).slice(0, 4);
    const obsPaths = obsLines.map((line) => {
      const lineSize = fitFontSize(line, 'serif', innerW, 13, 10);
      const p = textPath(line, 'serif', lineSize, innerLeft, y, 'left', 'middle');
      y += 22;
      return `<path d="${p}" fill="${INK}"/>`;
    });
    y += 8;

    const metaLines: string[] = [];
    metaLines.push(`— Habitat: ${data.originLanguage ?? 'unknown'}.`);
    if (data.etymology) {
      metaLines.push(`— Etymology: ${truncate(data.etymology.replace(/^From\s+/i, 'from '), 60)}`);
    }
    const metaPaths = metaLines.map((line) => {
      const size = fitFontSize(line, 'serif-italic', innerW, 12, 10);
      const p = textPath(line, 'serif-italic', size, innerLeft, y, 'left', 'middle');
      y += 22;
      return `<path d="${p}" fill="${ETYM_INK}"/>`;
    });

    const footerY = height - 32;
    const sigPath = textPath('— EWB, lexicographer at large', 'serif-italic', 12, innerLeft, footerY, 'left', 'middle');
    const watermarkPath = textPath(watermark.toUpperCase(), 'mono', 11, innerRight, footerY, 'right', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${PAPER}"/>
        ${rules.join('\n')}
        <path d="${headerLeft}" fill="${META}"/>
        <path d="${headerRight}" fill="${META}"/>
        ${headerRule}
        <path d="${introPath}" fill="${INK}"/>
        <path d="${wordPath}" fill="${INK}"/>
        <path d="${ipaPath}" fill="${META}"/>
        ${obsPaths.join('\n')}
        ${metaPaths.join('\n')}
        <path d="${sigPath}" fill="${META}"/>
        <path d="${watermarkPath}" fill="${META}"/>
      </svg>
    `;
  },
};
