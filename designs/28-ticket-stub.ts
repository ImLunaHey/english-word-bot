import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { entryNumber, extractCentury, truncate } from './utils';

const BACKDROP = '#2d3a4a';
const CREAM = '#f4ead0';
const RED = '#c44d3c';
const CREAM_TEXT = '#f5f1e4';
const LABEL = '#8a6a3a';
const RULE = '#c4a474';
const HEAD = '#2a1a0a';
const META = '#6a4a2a';
const QUOTE = '#4a2a1a';

function starPolygon(cx: number, cy: number, outer: number, inner: number, points = 5): string {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    coords.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return coords.join(' ');
}

export const ticketStub: Design = {
  name: 'ticket-stub',
  canRender: () => true,
  render: ({ data, watermark, width, height }) => {
    const ticketH = Math.round(height * 0.75);
    const ticketY = (height - ticketH) / 2;
    const ticketX = 40;
    const ticketW = width - ticketX * 2;
    const stubW = Math.round(ticketW / 3);
    const mainW = ticketW - stubW;
    const mainX = ticketX;
    const stubX = ticketX + mainW;
    const padX = 24;
    const innerLeft = mainX + padX;
    const innerRight = mainX + mainW - padX;

    const headerY = ticketY + 28;
    const headerPath = textPath('ADMIT ONE · WORD OF THE DAY', 'mono', 11, innerLeft, headerY, 'left', 'middle');
    const headerRuleY = headerY + 16;

    const wordSize = fitFontSize(data.word, 'serif-italic', mainW - padX * 2, 56, 26);
    const wordY = headerRuleY + 50;
    const wordPath = textPath(data.word, 'serif-italic', wordSize, innerLeft, wordY, 'left', 'middle');

    const partIpaY = wordY + wordSize / 2 + 22;
    const partIpaText = [
      data.partOfSpeech || null,
      data.ipa ? `/${data.ipa}/` : null,
    ].filter(Boolean).join(' · ') || '—';
    const partIpaPath = textPath(partIpaText, 'mono', 12, innerLeft, partIpaY, 'left', 'middle');

    const quoteSize = 14;
    const quoteText = data.definition ? `"${truncate(data.definition, 56)}"` : '"a word worth knowing"';
    const quoteY = ticketY + ticketH * 0.66;
    const quoteFitSize = fitFontSize(quoteText, 'serif-italic', mainW - padX * 2, quoteSize, 10);
    const quotePath = textPath(quoteText, 'serif-italic', quoteFitSize, innerLeft, quoteY, 'left', 'middle');

    const footerY = ticketY + ticketH - 22;
    const footerLeft = textPath(`SEC. ${(data.partOfSpeech || 'NOUN').toUpperCase().slice(0, 6)}`, 'mono', 10, innerLeft, footerY, 'left', 'middle');
    const footerCenter = textPath(`ROW ${(data.originLanguage ?? '—').toUpperCase().slice(0, 6)}`, 'mono', 10, mainX + mainW / 2, footerY, 'center', 'middle');
    const footerRight = textPath(`SEAT ${extractCentury(data.etymology) ?? '—'}`, 'mono', 10, innerRight, footerY, 'right', 'middle');

    const stubCx = stubX + stubW / 2;
    const verticalReserve = ticketH * 0.42;
    const stubTopY = ticketY + verticalReserve / 2 + 30;
    const stubBotY = ticketY + ticketH - verticalReserve / 2 - 30;
    const topText = `NO. ${entryNumber(data.word)} · EWB`;
    const bottomText = watermark.replace(/^@/, '');
    const topFitSize = fitFontSize(topText, 'mono', verticalReserve, 11, 8);
    const bottomFitSize = fitFontSize(bottomText, 'mono', verticalReserve, 11, 8);
    const topTextPath = textPath(topText, 'mono', topFitSize, 0, 0, 'center', 'middle');
    const bottomTextPath = textPath(bottomText, 'mono', bottomFitSize, 0, 0, 'center', 'middle');

    const starOuter = 26;
    const starInner = 12;
    const starCy = ticketY + ticketH / 2;
    const star = starPolygon(stubCx, starCy, starOuter, starInner);

    const shadow = `<rect x="${ticketX + 8}" y="${ticketY + 8}" width="${ticketW}" height="${ticketH}" fill="rgba(0,0,0,0.35)"/>`;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BACKDROP}"/>
        ${shadow}
        <rect x="${mainX}" y="${ticketY}" width="${mainW}" height="${ticketH}" fill="${CREAM}"/>
        <rect x="${stubX}" y="${ticketY}" width="${stubW}" height="${ticketH}" fill="${RED}"/>
        <line x1="${stubX}" y1="${ticketY}" x2="${stubX}" y2="${ticketY + ticketH}" stroke="${BACKDROP}" stroke-width="1.5" stroke-dasharray="4 4"/>
        <path d="${headerPath}" fill="${LABEL}"/>
        <line x1="${innerLeft}" y1="${headerRuleY}" x2="${innerRight}" y2="${headerRuleY}" stroke="${RULE}" stroke-width="1"/>
        <path d="${wordPath}" fill="${HEAD}"/>
        <path d="${partIpaPath}" fill="${META}"/>
        <path d="${quotePath}" fill="${QUOTE}"/>
        <path d="${footerLeft}" fill="${LABEL}"/>
        <path d="${footerCenter}" fill="${LABEL}"/>
        <path d="${footerRight}" fill="${LABEL}"/>
        <g transform="translate(${stubCx} ${stubTopY}) rotate(-90)"><path d="${topTextPath}" fill="${CREAM_TEXT}"/></g>
        <polygon points="${star}" fill="${CREAM_TEXT}"/>
        <g transform="translate(${stubCx} ${stubBotY}) rotate(-90)"><path d="${bottomTextPath}" fill="${CREAM_TEXT}"/></g>
      </svg>
    `;
  },
};
