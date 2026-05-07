import type { WordData } from '../dictionary';

export interface DesignContext {
  data: WordData;
  watermark: string;
  width: number;
  height: number;
}

export interface Design {
  name: string;
  canRender: (data: WordData) => boolean;
  render: (ctx: DesignContext) => string;
}

export type FontFamily = 'sans' | 'sans-bold' | 'serif' | 'serif-italic' | 'mono';
