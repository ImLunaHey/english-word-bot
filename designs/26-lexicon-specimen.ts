import type { Design } from './types';
import { textPath, fitFontSize, measureText } from './fonts';
import { entryNumber, truncate } from './utils';
import { splitMorphemes } from './morphemes';

const BG = '#2a2820';
const ACCENT = '#d4a574';
const TEXT = '#f4ead8';
const SOFT = '#c8baa0';
const LABEL = '#6a5a3a';
const RULE = '#5a4a2a';

const CENTURY_WORDS = ['first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth','eleventh','twelfth','thirteenth','fourteenth','fifteenth','sixteenth','seventeenth','eighteenth','nineteenth','twentieth','twenty-first'];

function epochFromEtymology(etymology: string | null): string {
  if (!etymology) return '—';
  const yearMatch = etymology.match(/\b(\d{4})\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    if (year >= 1000 && year <= 2100) {
      const c = Math.ceil(year / 100);
      const word = CENTURY_WORDS[c - 1];
      return word ? `${word} century` : `${c}th century`;
    }
  }
  const centuryMatch = etymology.match(/\b(\d{1,2})(?:st|nd|rd|th)\s+century\b/i);
  if (centuryMatch) {
    const c = parseInt(centuryMatch[1], 10);
    const word = CENTURY_WORDS[c - 1];
    return word ? `${word} century` : `${c}th century`;
  }
  return '—';
}

export const lexiconSpecimen: Design = {
  name: 'lexicon-specimen',
  canRender: () => true,
  render: ({ data, watermark, width, height }) => {
    const padX = 36;
    const labelSize = 12;

    const headerLeftPath = textPath(`SPECIMEN №${entryNumber(data.word)}`, 'mono', labelSize, padX, 50, 'left', 'middle');
    const headerRightPath = textPath('ENGLISH LEXICON DEPT.', 'mono', labelSize, width - padX, 50, 'right', 'middle');

    const wordSize = fitFontSize(data.word, 'serif-italic', width - padX * 2, 88, 38);
    const wordCenterY = height * 0.42;
    const wordPath = textPath(data.word, 'serif-italic', wordSize, padX, wordCenterY, 'left', 'middle');

    const { segments } = splitMorphemes(data.word);
    let segmentRow = '';
    if (segments.length > 1) {
      segmentRow = segments.map(s => s.toUpperCase()).join(' · ');
    }
    const segmentY = wordCenterY + wordSize / 2 + 28;
    const segmentPath = segmentRow ? textPath(segmentRow, 'mono', 12, padX, segmentY, 'left', 'middle') : '';

    const gridStartY = segmentY + 60;
    const labelW = 70;
    const valueX = padX + labelW;
    const valueMaxW = width - valueX - padX;
    const rowH = 24;

    const partLabel = data.partOfSpeech ? `${data.partOfSpeech.toLowerCase()}${data.partOfSpeech ? ` (${data.partOfSpeech.charAt(0).toLowerCase()}.)` : ''}` : '—';
    const ipaLabel = data.ipa ? `/${data.ipa}/` : '—';
    const derivLabel = data.etymology ? truncate(data.etymology, 38) : '—';
    const senseLabel = data.definition ? truncate(data.definition, 38) : '—';
    const epochLabel = epochFromEtymology(data.etymology);

    const rows: Array<{ label: string; value: string; emphasized?: boolean }> = [
      { label: 'CLASS', value: partLabel },
      { label: 'PHON', value: ipaLabel },
      { label: 'DERIV', value: derivLabel },
      { label: 'SENSE', value: senseLabel, emphasized: true },
      { label: 'EPOCH', value: epochLabel },
    ];

    const rowPaths = rows.flatMap((row, i) => {
      const y = gridStartY + i * rowH;
      const fitValue = row.value.length > 32 ? truncate(row.value, 38) : row.value;
      const valueSize = fitFontSize(fitValue, 'mono', valueMaxW, 12, 9);
      const lp = textPath(row.label, 'mono', 12, padX, y, 'left', 'middle');
      const vp = textPath(fitValue, 'mono', valueSize, valueX, y, 'left', 'middle');
      return [
        `<path d="${lp}" fill="${LABEL}"/>`,
        `<path d="${vp}" fill="${row.emphasized ? TEXT : SOFT}"/>`,
      ];
    });

    const gridTopRuleY = gridStartY - 18;
    const segRuleY = 70;

    const watermarkPath = textPath(`— ${watermark} —`, 'mono', 11, width / 2, height - 30, 'center', 'middle');
    void measureText;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <path d="${headerLeftPath}" fill="${ACCENT}"/>
        <path d="${headerRightPath}" fill="${ACCENT}"/>
        <line x1="${padX}" y1="${segRuleY}" x2="${width - padX}" y2="${segRuleY}" stroke="${RULE}" stroke-width="1"/>
        <path d="${wordPath}" fill="${TEXT}"/>
        ${segmentPath ? `<path d="${segmentPath}" fill="${ACCENT}"/>` : ''}
        <line x1="${padX}" y1="${gridTopRuleY}" x2="${width - padX}" y2="${gridTopRuleY}" stroke="${RULE}" stroke-width="1"/>
        ${rowPaths.join('\n')}
        <path d="${watermarkPath}" fill="${RULE}"/>
      </svg>
    `;
  },
};
