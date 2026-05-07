import type { Design } from './types';
import { textPath, fitFontSize } from './fonts';
import { extractCentury, truncate } from './utils';

const PAPER = '#d8c8a0';
const INK = '#2a1a0a';
const SOFT = '#4a2a1a';
const RED = '#c44d3c';
const RULE_INK = '#4a2a1a';

export const wantedPoster: Design = {
  name: 'wanted-poster',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const padX = 60;
    const innerW = width - padX * 2;
    const cx = width / 2;

    let y = 80;
    const wantedSize = fitFontSize('WANTED', 'serif', innerW, 64, 36);
    const wantedPath = textPath('WANTED', 'serif', wantedSize, cx, y, 'center', 'middle');
    y += wantedSize / 2 + 20;

    const subtitlePath = textPath('— for use in your vocabulary —', 'serif-italic', 14, cx, y, 'center', 'middle');
    y += 22;

    const ruleW1 = innerW * 0.5;
    const ruleA = `<line x1="${cx - ruleW1 / 2}" y1="${y}" x2="${cx + ruleW1 / 2}" y2="${y}" stroke="${RULE_INK}" stroke-width="1"/>`;
    y += 30;

    const panelMargin = 40;
    const panelInnerW = innerW - panelMargin * 2;
    const wordSize = fitFontSize(data.word, 'serif-italic', panelInnerW, 44, 18);
    const panelH = Math.max(wordSize + 60, 80);
    const panelW = innerW * 0.85;
    const panelX = (width - panelW) / 2;
    const panelY = y;
    const panelOuter = `<rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" fill="none" stroke="${INK}" stroke-width="3"/>`;
    const panelInner = `<rect x="${panelX + 5}" y="${panelY + 5}" width="${panelW - 10}" height="${panelH - 10}" fill="none" stroke="${INK}" stroke-width="1"/>`;
    const wordY = panelY + panelH / 2 - 8;
    const wordPath = textPath(data.word, 'serif-italic', wordSize, cx, wordY, 'center', 'middle');
    const subY = panelY + panelH - 18;
    const subText = `${data.partOfSpeech || '—'}${data.ipa ? ` · /${data.ipa}/` : ''}`;
    const subSize = fitFontSize(subText, 'mono', panelW - 32, 12, 9);
    const subPath = textPath(subText, 'mono', subSize, cx, subY, 'center', 'middle');
    y = panelY + panelH + 24;

    const quoteText = `"${truncate(data.definition, 60)}"`;
    const quoteSize = fitFontSize(quoteText, 'serif', innerW * 0.92, 14, 11);
    const quotePath = textPath(quoteText, 'serif', quoteSize, cx, y, 'center', 'middle');
    y += 28;

    const ruleB = `<line x1="${cx - ruleW1 / 2}" y1="${y}" x2="${cx + ruleW1 / 2}" y2="${y}" stroke="${RULE_INK}" stroke-width="1"/>`;
    y += 30;

    const rewardText = 'REWARD: MORE ELOQUENT SPEECH';
    const rewardSize = fitFontSize(rewardText, 'serif', innerW * 0.95, 16, 9);
    const rewardPath = textPath(rewardText, 'serif', rewardSize, cx, y, 'center', 'middle');
    y += 30;

    const lastSeenText = `LAST SEEN — ${(data.originLanguage ?? 'UNKNOWN').toUpperCase()}, ${extractCentury(data.etymology) ?? '—'} — REPORT TO ${watermark.toUpperCase()}`;
    const lastSeenSize = fitFontSize(lastSeenText, 'mono', innerW, 11, 7);
    const lastSeenY = height - 40;
    const lastSeenPath = textPath(lastSeenText, 'mono', lastSeenSize, cx, lastSeenY, 'center', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${PAPER}"/>
        <path d="${wantedPath}" fill="${INK}"/>
        <path d="${subtitlePath}" fill="${SOFT}"/>
        ${ruleA}
        ${panelOuter}
        ${panelInner}
        <path d="${wordPath}" fill="${INK}"/>
        <path d="${subPath}" fill="${SOFT}"/>
        <path d="${quotePath}" fill="${INK}"/>
        ${ruleB}
        <path d="${rewardPath}" fill="${RED}"/>
        <path d="${lastSeenPath}" fill="${SOFT}"/>
      </svg>
    `;
  },
};
