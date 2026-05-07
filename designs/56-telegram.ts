import type { Design } from './types';
import { textPath, fitFontSize, measureText } from './fonts';
import { entryNumber, extractCentury, todayISO } from './utils';

const PAPER = '#d4cab0';
const INK = '#1a1a1a';
const META = '#5a4a2a';
const LABEL = '#8a6a3a';
const STOP = '#c44d3c';

function starPolygon(cx: number, cy: number, outer: number, inner: number, points = 5): string {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    coords.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return coords.join(' ');
}

export const telegram: Design = {
  name: 'telegram',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const padX = 28;
    const innerLeft = padX;
    const innerRight = width - padX;
    const innerW = innerRight - innerLeft;

    const titleText = 'TELEGRAM';
    const titleSize = 16;
    const titleY = 32;
    const titleW = measureText(titleText, 'mono', titleSize).width;
    const titlePath = textPath(titleText, 'mono', titleSize, width / 2, titleY, 'center', 'middle');
    const starOffset = titleW / 2 + 18;
    const starLeft = starPolygon(width / 2 - starOffset, titleY, 6, 2.5);
    const starRight = starPolygon(width / 2 + starOffset, titleY, 6, 2.5);

    const subTitle = 'VIA THE TRANS-LEXICAL CABLE CO.';
    const subTitleSize = fitFontSize(subTitle, 'mono', innerW, 10, 8);
    const subTitlePath = textPath(subTitle, 'mono', subTitleSize, width / 2, titleY + 22, 'center', 'middle');

    const idPath = textPath(`NO. ${entryNumber(data.word)}`, 'mono', 9, innerLeft, titleY + 22, 'left', 'middle');
    const originPath = textPath(`${extractCentury(data.etymology) ?? '—'} / ${(data.originLanguage ?? '—').toUpperCase()}`, 'mono', 9, innerRight, titleY + 22, 'right', 'middle');

    let y = titleY + 40;
    const headerRule = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${META}" stroke-width="1"/>`;
    y += 22;

    const labelW = 80;
    const valueX = innerLeft + labelW;
    const metaRows: Array<[string, string]> = [
      ['FROM', 'WIKTIONARY DEPT.'],
      ['TO', 'READERS, EVERYWHERE'],
      ['FILED', `${todayISO().replace(/-/g, '·')} · 14:20`],
    ];
    const metaPaths = metaRows.flatMap(([lbl, val]) => {
      const lp = textPath(lbl, 'mono', 10, innerLeft, y, 'left', 'middle');
      const valSize = fitFontSize(val, 'mono', innerRight - valueX, 11, 8);
      const vp = textPath(val, 'mono', valSize, valueX, y, 'left', 'middle');
      y += 18;
      return [
        `<path d="${lp}" fill="${LABEL}"/>`,
        `<path d="${vp}" fill="${INK}"/>`,
      ];
    });
    y += 4;
    const metaRule = `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${META}" stroke-width="1" stroke-dasharray="4 3"/>`;
    y += 22;

    const bodyLines: string[] = [];
    bodyLines.push('WORD RECEIVED');
    bodyLines.push(data.word.toUpperCase());
    if (data.partOfSpeech) bodyLines.push(data.partOfSpeech.toUpperCase());
    if (data.ipa) bodyLines.push(`PRONOUNCED /${data.ipa.toUpperCase()}/`);
    const defParts = data.definition.replace(/\.$/, '').toUpperCase().split(/\s+(?:OR|AND)\s+/);
    defParts.forEach((part, i) => {
      bodyLines.push(i === 0 ? `MEANS ${part}` : `OR ${part}`);
    });
    if (data.originLanguage) {
      const root = data.etymology?.match(/[a-z]{4,}/i)?.[0]?.toUpperCase();
      bodyLines.push(`FROM ${data.originLanguage.toUpperCase()}${root && root !== data.originLanguage.toUpperCase() ? ` ${root}` : ''}`);
    }
    bodyLines.push('USE WITH CARE');
    const limited = bodyLines.slice(0, 8);

    const bodyOut: string[] = [];
    const bodyFontSize = 13;
    const bodyLineH = 24;
    limited.forEach((line, i) => {
      const isLast = i === limited.length - 1;
      const stopText = isLast ? ' FULL STOP' : ' STOP';
      const lineFitSize = fitFontSize(line + stopText, 'mono', innerW, bodyFontSize, 9);
      const lineW = measureText(line, 'mono', lineFitSize).width;
      const linePath = textPath(line, 'mono', lineFitSize, innerLeft, y, 'left', 'middle');
      const stopPath = textPath(stopText, 'mono', lineFitSize, innerLeft + lineW, y, 'left', 'middle');
      bodyOut.push(`<path d="${linePath}" fill="${INK}"/>`);
      bodyOut.push(`<path d="${stopPath}" fill="${STOP}"/>`);
      y += bodyLineH;
    });

    const footerRuleY = height - 38;
    const footerRule = `<line x1="${innerLeft}" y1="${footerRuleY}" x2="${innerRight}" y2="${footerRuleY}" stroke="${META}" stroke-width="1"/>`;
    const footerY = height - 22;
    const footerLeft = textPath('SIGNED · EWB', 'mono', 9, innerLeft, footerY, 'left', 'middle');
    const footerRight = textPath(watermark.toUpperCase(), 'mono', 9, innerRight, footerY, 'right', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${PAPER}"/>
        <polygon points="${starLeft}" fill="${INK}"/>
        <path d="${titlePath}" fill="${INK}"/>
        <polygon points="${starRight}" fill="${INK}"/>
        <path d="${subTitlePath}" fill="${META}"/>
        <path d="${idPath}" fill="${META}"/>
        <path d="${originPath}" fill="${META}"/>
        ${headerRule}
        ${metaPaths.join('\n')}
        ${metaRule}
        ${bodyOut.join('\n')}
        ${footerRule}
        <path d="${footerLeft}" fill="${META}"/>
        <path d="${footerRight}" fill="${META}"/>
      </svg>
    `;
  },
};
