import type { Design } from './types';
import { textPath, fitFontSize, measureText } from './fonts';
import { splitMorphemes } from './morphemes';

const BG = '#1a1a1a';
const DIM = '#888888';
const COLORS = ['#d4a574', '#b8d4a5', '#c9a5d4', '#a5c9d4'];

export const etymologyBreakdown: Design = {
  name: 'etymology-breakdown',
  canRender: (d) => !!d.etymology,
  render: ({ data, watermark, width, height }) => {
    const { segments, glosses } = splitMorphemes(data.word);
    const padding = 60;

    const dotSep = ' · ';
    const fullText = segments.join(dotSep);
    const wordSize = fitFontSize(fullText, 'sans-bold', width - padding * 2, 90, 40);

    const sepWidth = measureText(dotSep, 'sans-bold', wordSize).width;
    const segWidths = segments.map(s => measureText(s, 'sans-bold', wordSize).width);
    const totalWidth = segWidths.reduce((a, b) => a + b, 0) + sepWidth * (segments.length - 1);
    let cursor = (width - totalWidth) / 2;

    const segPaths: string[] = [];
    const glossPaths: string[] = [];
    for (let i = 0; i < segments.length; i++) {
      const color = COLORS[i % COLORS.length];
      const segPath = textPath(segments[i], 'sans-bold', wordSize, cursor, height * 0.45, 'left', 'middle');
      segPaths.push(`<path d="${segPath}" fill="${color}"/>`);

      const segCenterX = cursor + segWidths[i] / 2;
      const codeText = segments[i].toUpperCase();
      const codePath = textPath(codeText, 'mono', 12, segCenterX, height * 0.65, 'center', 'middle');
      glossPaths.push(`<path d="${codePath}" fill="${color}"/>`);
      if (glosses[i]) {
        const glossPath = textPath(glosses[i]!, 'mono', 11, segCenterX, height * 0.65 + 20, 'center', 'middle');
        glossPaths.push(`<path d="${glossPath}" fill="${DIM}"/>`);
      }

      cursor += segWidths[i];
      if (i < segments.length - 1) {
        const sepPath = textPath(dotSep, 'sans-bold', wordSize, cursor, height * 0.45, 'left', 'middle');
        segPaths.push(`<path d="${sepPath}" fill="${DIM}"/>`);
        cursor += sepWidth;
      }
    }

    const watermarkPath = textPath(watermark, 'mono', 14, width / 2, height - 40, 'center', 'middle');
    const langLabel = data.originLanguage ? `${data.originLanguage.toUpperCase()} ROOTS` : 'ETYMOLOGY';
    const langPath = textPath(langLabel, 'mono', 12, width / 2, 80, 'center', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <path d="${langPath}" fill="${DIM}"/>
        ${segPaths.join('\n')}
        ${glossPaths.join('\n')}
        <path d="${watermarkPath}" fill="${DIM}"/>
      </svg>
    `;
  },
};
