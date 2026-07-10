import type { TFontFormatExt } from './types';

export const FONT_FORMAT: Record<TFontFormatExt, string> = {
  woff2: 'woff2',
  woff: 'woff',
  ttf: 'truetype',
  otf: 'opentype',
  eot: 'embedded-opentype',
  otc: 'collection',
  ttc: 'collection',
};
