import * as opentype from 'opentype.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { FontFamily } from './types';

const FONT_FILES: Record<FontFamily, string> = {
  'sans': 'LiberationSans-Regular.ttf',
  'sans-bold': 'LiberationSans-Bold.ttf',
  'serif': 'LiberationSerif-Regular.ttf',
  'serif-italic': 'LiberationSerif-Italic.ttf',
  'mono': 'LiberationMono-Regular.ttf',
};

const fonts: Partial<Record<FontFamily, opentype.Font>> = {};

function loadFont(family: FontFamily): opentype.Font {
  if (fonts[family]) return fonts[family]!;
  const buf = readFileSync(join(__dirname, '..', 'fonts', FONT_FILES[family]));
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  fonts[family] = font;
  return font;
}

export function textPath(
  text: string,
  family: FontFamily,
  fontSize: number,
  x: number,
  y: number,
  align: 'left' | 'center' | 'right' = 'left',
  baseline: 'top' | 'middle' | 'alphabetic' = 'alphabetic',
): string {
  const font = loadFont(family);
  const measured = font.getPath(text, 0, 0, fontSize);
  const bbox = measured.getBoundingBox();
  const width = bbox.x2 - bbox.x1;
  const height = bbox.y2 - bbox.y1;

  const advance = font.getAdvanceWidth(text, fontSize);
  let dx = x;
  if (align === 'center') dx = x - advance / 2;
  if (align === 'right') dx = x - advance;

  let dy = y;
  if (baseline === 'top') dy = y - bbox.y1;
  if (baseline === 'middle') dy = y - height / 2 - bbox.y1;

  return font.getPath(text, dx, dy, fontSize).toPathData(2);
}

export function measureText(text: string, family: FontFamily, fontSize: number): { width: number; height: number } {
  const font = loadFont(family);
  const path = font.getPath(text, 0, 0, fontSize);
  const bbox = path.getBoundingBox();
  return { width: font.getAdvanceWidth(text, fontSize), height: bbox.y2 - bbox.y1 };
}

export function fitFontSize(text: string, family: FontFamily, maxWidth: number, maxFontSize: number, minFontSize: number): number {
  const font = loadFont(family);
  let size = maxFontSize;
  while (size > minFontSize) {
    const w = font.getAdvanceWidth(text, size);
    if (w <= maxWidth) return size;
    size -= 2;
  }
  return minFontSize;
}
