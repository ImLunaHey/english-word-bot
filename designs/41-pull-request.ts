import type { Design } from './types';
import { textPath, fitFontSize, measureText } from './fonts';
import { entryNumber, extractCentury, truncate } from './utils';

const BG = '#f5f5f0';
const HEADER_BG = '#1a1a1a';
const HEADER_TEXT = '#c8d4e0';
const HEADER_ORG = '#888888';
const HEADER_REPO = '#f5f5f0';
const STATUS_BG = '#2a8a4a';
const STATUS_TEXT = '#ffffff';
const INK = '#1a1a1a';
const SOFT = '#555555';
const TITLE_LINK = '#2a4a8a';
const CHIP_BG = '#e8e8e0';
const WORD_CHIP_BG = '#fff4d4';
const DIFF_BG = '#1a1a1a';
const DIFF_TEXT = '#c8d4e0';
const DIFF_FILE = '#5a7a5a';
const DIFF_ADD = '#6affb0';
const DIFF_KEY = '#f4c478';
const FOOTER_BG = '#ebe8e0';
const FOOTER_TEXT = '#888888';

interface Tag { label: string; bg: string; fg: string; }

export const pullRequest: Design = {
  name: 'pull-request',
  canRender: () => true,
  render: ({ data, watermark, width, height }) => {
    const padX = 22;
    const headerH = 40;
    const footerH = 28;

    const orgText = 'englishwordbot';
    const sepText = ' / ';
    const repoText = 'vocabulary';
    const orgSize = 12;
    const orgW = measureText(orgText, 'mono', orgSize).width;
    const sepW = measureText(sepText, 'mono', orgSize).width;
    const repoW = measureText(repoText, 'mono', orgSize).width;
    const headerY = headerH / 2;
    const orgPath = textPath(orgText, 'mono', orgSize, padX, headerY, 'left', 'middle');
    const sepPath = textPath(sepText, 'mono', orgSize, padX + orgW, headerY, 'left', 'middle');
    const repoPath = textPath(repoText, 'mono', orgSize, padX + orgW + sepW, headerY, 'left', 'middle');

    const statusText = 'Open';
    const statusFontSize = 11;
    const statusW = measureText(statusText, 'sans-bold', statusFontSize).width + 18;
    const statusH = 18;
    const statusX = width - padX - statusW;
    const statusY = headerY - statusH / 2;
    const statusRect = `<rect x="${statusX}" y="${statusY}" width="${statusW}" height="${statusH}" rx="9" fill="${STATUS_BG}"/>`;
    const statusTextPath = textPath(statusText, 'sans-bold', statusFontSize, statusX + statusW / 2, headerY, 'center', 'middle');

    let y = headerH + 26;
    const titlePrefix = 'Add ';
    const titleSuffix = ' to active vocabulary';
    const entryText = ` #${entryNumber(data.word)}`;
    const titleSize = 16;
    const wordChipSize = 14;

    const titlePrefixSize = fitFontSize(titlePrefix, 'sans-bold', width - padX * 2, titleSize, 11);
    const usableSize = titlePrefixSize;
    const titlePrefixW = measureText(titlePrefix, 'sans-bold', usableSize).width;
    const wordChipPad = 12;
    const wordChipTextW = measureText(data.word, 'mono', wordChipSize).width;
    const wordChipW = wordChipTextW + wordChipPad;
    const titleSuffixW = measureText(titleSuffix, 'sans-bold', usableSize).width;
    const entryW = measureText(entryText, 'sans-bold', usableSize).width;
    const totalTitleW = titlePrefixW + wordChipW + titleSuffixW + entryW;
    const finalSize = totalTitleW > width - padX * 2 ? fitFontSize(titlePrefix + data.word + titleSuffix + entryText, 'sans-bold', width - padX * 2, titleSize, 9) : usableSize;
    const finalChipSize = Math.max(8, finalSize - 2);
    const finalPrefixW = measureText(titlePrefix, 'sans-bold', finalSize).width;
    const finalChipTextW = measureText(data.word, 'mono', finalChipSize).width;
    const finalChipW = finalChipTextW + wordChipPad;
    const finalSuffixW = measureText(titleSuffix, 'sans-bold', finalSize).width;

    const titleY = y;
    const titlePrefixPath = textPath(titlePrefix, 'sans-bold', finalSize, padX, titleY, 'left', 'middle');
    const wordChipRect = `<rect x="${padX + finalPrefixW}" y="${titleY - finalChipSize / 2 - 4}" width="${finalChipW}" height="${finalChipSize + 8}" rx="3" fill="${WORD_CHIP_BG}"/>`;
    const wordChipTextPath = textPath(data.word, 'mono', finalChipSize, padX + finalPrefixW + 6, titleY, 'left', 'middle');
    const titleSuffixPath = textPath(titleSuffix, 'sans-bold', finalSize, padX + finalPrefixW + finalChipW + 6, titleY, 'left', 'middle');
    const entryPath = textPath(entryText, 'sans-bold', finalSize, padX + finalPrefixW + finalChipW + 6 + finalSuffixW, titleY, 'left', 'middle');
    y += 24;

    const subText = `englishwordbot wants to merge 1 commit into main from add/${data.word.toLowerCase()}`;
    const subSize = fitFontSize(subText, 'mono', width - padX * 2, 11, 8);
    const subPath = textPath(subText, 'mono', subSize, padX, y, 'left', 'middle');
    y += 22;

    const diffX = padX;
    const diffW = width - padX * 2;
    const diffPadX = 14;
    const diffStartY = y;
    let dy = diffStartY + 22;
    const diffLineH = 20;
    const diffFontSize = 12;

    const diffLines: Array<{ key: string; value: string }> = [
      { key: 'word', value: data.word },
      ...(data.partOfSpeech ? [{ key: 'type', value: data.partOfSpeech }] : []),
      ...(data.ipa ? [{ key: 'ipa', value: `/${data.ipa}/` }] : []),
      ...(data.definition ? [{ key: 'def', value: truncate(data.definition.toLowerCase(), 40) }] : []),
      ...(data.originLanguage ? [{ key: 'from', value: `${data.originLanguage.toLowerCase()}${extractCentury(data.etymology) ? ` (${extractCentury(data.etymology)})` : ''}` }] : []),
    ];

    const fileLinePath = textPath(`+++ vocabulary/${data.word.toLowerCase()}.md`, 'mono', diffFontSize, diffX + diffPadX, dy, 'left', 'middle');
    const fileLine = `<path d="${fileLinePath}" fill="${DIFF_FILE}"/>`;
    dy += diffLineH;

    const diffOut: string[] = [];
    for (const line of diffLines) {
      const linePrefix = '+ ';
      const keyText = line.key + ': ';
      const valueText = line.value;
      const prefixW = measureText(linePrefix, 'mono', diffFontSize).width;
      const keyW = measureText(keyText, 'mono', diffFontSize).width;

      const lineBgW = diffW - diffPadX * 2;
      diffOut.push(`<rect x="${diffX + diffPadX - 2}" y="${dy - diffLineH / 2}" width="${lineBgW + 4}" height="${diffLineH - 2}" fill="${DIFF_ADD}" fill-opacity="0.15"/>`);

      const prefixPath = textPath(linePrefix, 'mono', diffFontSize, diffX + diffPadX, dy, 'left', 'middle');
      diffOut.push(`<path d="${prefixPath}" fill="${DIFF_ADD}"/>`);
      const keyPath = textPath(keyText, 'mono', diffFontSize, diffX + diffPadX + prefixW, dy, 'left', 'middle');
      diffOut.push(`<path d="${keyPath}" fill="${DIFF_KEY}"/>`);
      const valueSize = fitFontSize(valueText, 'mono', diffW - diffPadX * 2 - prefixW - keyW, diffFontSize, 9);
      const valuePath = textPath(valueText, 'mono', valueSize, diffX + diffPadX + prefixW + keyW, dy, 'left', 'middle');
      diffOut.push(`<path d="${valuePath}" fill="${DIFF_TEXT}"/>`);
      dy += diffLineH;
    }

    const diffH = dy - diffStartY + 8;
    const diffRect = `<rect x="${diffX}" y="${diffStartY}" width="${diffW}" height="${diffH}" rx="6" fill="${DIFF_BG}"/>`;
    y = diffStartY + diffH + 18;

    const tags: Tag[] = [
      { label: 'archaic', bg: '#d4a8e8', fg: '#4a1a6a' },
    ];
    if (data.originLanguage) tags.push({ label: data.originLanguage.toLowerCase(), bg: '#a8d4e8', fg: '#1a4a6a' });
    tags.push({ label: (data.partOfSpeech || 'word').toLowerCase(), bg: '#e8d4a8', fg: '#6a4a1a' });

    const tagPaths: string[] = [];
    let tagX = padX;
    const tagFontSize = 10;
    const tagPadX = 10;
    const tagH = 18;
    for (const tag of tags) {
      const tagW = measureText(tag.label, 'mono', tagFontSize).width + tagPadX * 2;
      if (tagX + tagW > width - padX) break;
      tagPaths.push(`<rect x="${tagX}" y="${y - tagH / 2}" width="${tagW}" height="${tagH}" rx="9" fill="${tag.bg}"/>`);
      const tp = textPath(tag.label, 'mono', tagFontSize, tagX + tagW / 2, y, 'center', 'middle');
      tagPaths.push(`<path d="${tp}" fill="${tag.fg}"/>`);
      tagX += tagW + 6;
    }

    const footerY = height - footerH / 2;
    const footerLeft = textPath(`+${diffLines.length} -0  checks passing`, 'mono', 10, padX, footerY, 'left', 'middle');
    const footerRight = textPath(watermark.replace(/^@/, ''), 'mono', 10, width - padX, footerY, 'right', 'middle');

    void CHIP_BG; void HEADER_TEXT;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BG}"/>
        <rect x="0" y="0" width="${width}" height="${headerH}" fill="${HEADER_BG}"/>
        <path d="${orgPath}" fill="${HEADER_ORG}"/>
        <path d="${sepPath}" fill="${HEADER_ORG}"/>
        <path d="${repoPath}" fill="${HEADER_REPO}"/>
        ${statusRect}
        <path d="${statusTextPath}" fill="${STATUS_TEXT}"/>
        <path d="${titlePrefixPath}" fill="${INK}"/>
        ${wordChipRect}
        <path d="${wordChipTextPath}" fill="${INK}"/>
        <path d="${titleSuffixPath}" fill="${INK}"/>
        <path d="${entryPath}" fill="${SOFT}"/>
        <path d="${subPath}" fill="${SOFT}"/>
        ${diffRect}
        ${fileLine}
        ${diffOut.join('\n')}
        ${tagPaths.join('\n')}
        <rect x="0" y="${height - footerH}" width="${width}" height="${footerH}" fill="${FOOTER_BG}"/>
        <path d="${footerLeft}" fill="${FOOTER_TEXT}"/>
        <path d="${footerRight}" fill="${FOOTER_TEXT}"/>
      </svg>
    `;
  },
};

void TITLE_LINK;
