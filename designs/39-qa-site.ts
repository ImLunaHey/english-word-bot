import type { Design } from './types';
import { textPath, fitFontSize, measureText } from './fonts';
import { entryNumber, truncate, wrapText } from './utils';

const BG = '#f5f5f0';
const HEADER_BG = '#1a1a1a';
const HEADER_TEXT = '#f4c478';
const HEADER_DIM = '#888888';
const INK = '#1a1a1a';
const TITLE_BLUE = '#2a4a8a';
const SOFT = '#555555';
const ANSWER_BG = '#e8f0e8';
const ANSWER_BORDER = '#2a8a4a';
const ANSWER_TEXT = '#1a2a1a';
const TAG_BG = '#e0e8f0';
const TAG_TEXT = '#2a4a8a';
const FOOTER_BG = '#ebe8e0';
const FOOTER_TEXT = '#888888';
const HIGHLIGHT = '#ffe9a8';
const VOTE_NUM = '#2a4a8a';
const VOTE_ARROW = '#888888';
const STAR = '#c4a474';

export const qaSite: Design = {
  name: 'qa-site',
  canRender: (d) => !!d.definition,
  render: ({ data, watermark, width, height }) => {
    const headerH = 40;
    const footerH = 30;
    const padX = 22;

    const titleSitePath = textPath('word·overflow', 'sans-bold', 14, padX, headerH / 2, 'left', 'middle');
    const tagText = `[${(data.partOfSpeech || 'word').toLowerCase()}]   [vocabulary]`;
    const tagSize = fitFontSize(tagText, 'mono', 220, 11, 8);
    const headerTagsPath = textPath(tagText, 'mono', tagSize, width - padX, headerH / 2, 'right', 'middle');

    const voteColX = padX;
    const voteColW = 40;
    const contentX = voteColX + voteColW + 10;
    const contentW = width - contentX - padX;

    let y = headerH + 24;

    const voteUp = textPath('^', 'sans-bold', 18, voteColX + voteColW / 2, y, 'center', 'middle');
    y += 22;
    const voteCount = entryNumber(data.word);
    const voteCountPath = textPath(voteCount, 'sans-bold', 16, voteColX + voteColW / 2, y, 'center', 'middle');
    y += 22;
    const voteDown = textPath('v', 'sans-bold', 18, voteColX + voteColW / 2, y, 'center', 'middle');
    y += 26;
    const starCx = voteColX + voteColW / 2;
    const starPoly = starPolygon(starCx, y, 6, 2.5);

    let cy = headerH + 24;

    const titlePrefix = 'What does ';
    const titleSuffix = ' mean?';
    const titleSize = 18;
    const wordSize = 16;
    const prefixSize = fitFontSize(titlePrefix, 'sans-bold', contentW, titleSize, 12);
    const suffixSize = prefixSize;
    const wordCodeSize = Math.min(wordSize, prefixSize - 2);

    const prefixW = measureText(titlePrefix, 'sans-bold', prefixSize).width;
    const wordWidth = measureText(data.word, 'mono', wordCodeSize).width + 12;
    const suffixW = measureText(titleSuffix, 'sans-bold', suffixSize).width;

    const titleLineY = cy;
    const wordCodeY = titleLineY;
    const wordCodeRect = `<rect x="${contentX + prefixW}" y="${wordCodeY - wordCodeSize / 2 - 4}" width="${wordWidth}" height="${wordCodeSize + 10}" fill="${HIGHLIGHT}"/>`;
    const titlePrefixPath = textPath(titlePrefix, 'sans-bold', prefixSize, contentX, titleLineY, 'left', 'middle');
    const wordCodePath = textPath(data.word, 'mono', wordCodeSize, contentX + prefixW + 6, titleLineY, 'left', 'middle');
    const titleSuffixPath = textPath(titleSuffix, 'sans-bold', suffixSize, contentX + prefixW + wordWidth + 6, titleLineY, 'left', 'middle');
    cy += 32;

    const ipaQuestionText = `I came across this word and can't find it in modern usage.${data.ipa ? ` The IPA is /${data.ipa}/.` : ''}${data.originLanguage ? ` Looks ${data.originLanguage}?` : ''}`;
    const ipaLines = wrapText(ipaQuestionText, 60).slice(0, 3);
    const ipaQuestionPaths = ipaLines.map((line) => {
      const size = fitFontSize(line, 'sans-bold', contentW, 12, 9);
      const p = textPath(line, 'sans-bold', size, contentX, cy, 'left', 'middle');
      cy += 18;
      return `<path d="${p}" fill="${SOFT}"/>`;
    });
    cy += 10;

    const answerTop = cy;
    const answerPadX = 14;
    const answerLabelText = `ACCEPTED ANSWER · ${entryNumber(data.word)} votes`;
    const answerLabelSize = fitFontSize(answerLabelText, 'mono', contentW - answerPadX * 2, 11, 8);
    const answerLabelPath = textPath(answerLabelText, 'mono', answerLabelSize, contentX + answerPadX, answerTop + 18, 'left', 'middle');

    const answerBodyText = `It's a ${data.partOfSpeech || 'word'} meaning ${data.definition.replace(/\.$/, '')}.${data.etymology ? ` ${truncate(data.etymology, 90)}` : ''}`;
    const answerLines = wrapText(answerBodyText, 58).slice(0, 4);
    let abodyY = answerTop + 40;
    const answerBodyPaths = answerLines.map((line) => {
      const size = fitFontSize(line, 'sans-bold', contentW - answerPadX * 2, 12, 9);
      const p = textPath(line, 'sans-bold', size, contentX + answerPadX, abodyY, 'left', 'middle');
      abodyY += 18;
      return `<path d="${p}" fill="${ANSWER_TEXT}"/>`;
    });
    const answerBottom = abodyY + 8;
    const answerH = answerBottom - answerTop;

    const answerRect = `<rect x="${contentX}" y="${answerTop}" width="${contentW}" height="${answerH}" fill="${ANSWER_BG}"/>`;
    const answerBar = `<rect x="${contentX}" y="${answerTop}" width="3" height="${answerH}" fill="${ANSWER_BORDER}"/>`;

    cy = answerBottom + 16;

    const tags: string[] = [];
    if (data.originLanguage) tags.push(data.originLanguage.toLowerCase());
    if (data.partOfSpeech) tags.push(data.partOfSpeech.toLowerCase());
    tags.push('archaic');
    const defKeyword = data.definition.toLowerCase().match(/\b[a-z]{5,}\b/)?.[0];
    if (defKeyword) tags.push(defKeyword);

    const tagPaths: string[] = [];
    let tagX = contentX;
    const tagFontSize = 10;
    const tagH = 18;
    const tagPadX = 8;
    for (const tag of tags.slice(0, 4)) {
      const tagW = measureText(tag, 'mono', tagFontSize).width + tagPadX * 2;
      if (tagX + tagW > contentX + contentW) break;
      const tagRect = `<rect x="${tagX}" y="${cy - tagH / 2}" width="${tagW}" height="${tagH}" rx="3" fill="${TAG_BG}"/>`;
      const tagTextPath = textPath(tag, 'mono', tagFontSize, tagX + tagW / 2, cy, 'center', 'middle');
      tagPaths.push(tagRect);
      tagPaths.push(`<path d="${tagTextPath}" fill="${TAG_TEXT}"/>`);
      tagX += tagW + 6;
    }

    const footerY = height - footerH / 2;
    const footerLeft = textPath('asked today by anonymous', 'mono', 9, padX, footerY, 'left', 'middle');
    const footerRight = textPath(`${watermark.replace(/^@/, '')} · #${entryNumber(data.word)}`, 'mono', 9, width - padX, footerY, 'right', 'middle');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <rect x="0" y="0" width="${width}" height="${headerH}" fill="${HEADER_BG}"/>
        <path d="${titleSitePath}" fill="${HEADER_TEXT}"/>
        <path d="${headerTagsPath}" fill="${HEADER_DIM}"/>
        <path d="${voteUp}" fill="${VOTE_ARROW}"/>
        <path d="${voteCountPath}" fill="${VOTE_NUM}"/>
        <path d="${voteDown}" fill="${VOTE_ARROW}"/>
        <polygon points="${starPoly}" fill="${STAR}"/>
        ${wordCodeRect}
        <path d="${titlePrefixPath}" fill="${TITLE_BLUE}"/>
        <path d="${wordCodePath}" fill="${INK}"/>
        <path d="${titleSuffixPath}" fill="${TITLE_BLUE}"/>
        ${ipaQuestionPaths.join('\n')}
        ${answerRect}
        ${answerBar}
        <path d="${answerLabelPath}" fill="${ANSWER_BORDER}"/>
        ${answerBodyPaths.join('\n')}
        ${tagPaths.join('\n')}
        <rect x="0" y="${height - footerH}" width="${width}" height="${footerH}" fill="${FOOTER_BG}"/>
        <path d="${footerLeft}" fill="${FOOTER_TEXT}"/>
        <path d="${footerRight}" fill="${FOOTER_TEXT}"/>
      </svg>
    `;
  },
};

function starPolygon(cx: number, cy: number, outer: number, inner: number, points = 5): string {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    coords.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return coords.join(' ');
}

