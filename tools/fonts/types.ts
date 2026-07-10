export type TFontProps = {
  basePath: string;
  formats: TFontFormatExt[];
  variants: TFontVariant[];
} & TFontFaceProps &
  TFontFamilyProps;

export type TFontFormatExt = 'woff2' | 'woff' | 'ttf' | 'otf' | 'eot' | 'otc' | 'ttc';

export type TFontFaceProps = {
  name: string;
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
};

export type TFontVariant = {
  fileNamePostfix: string;
  weight?: number;
  style?: 'normal' | 'italic' | 'oblique';
};

export type TFontFamilyProps = {
  genericFamily:
    | 'serif'
    | 'sans-serif'
    | 'monospace'
    | 'cursive'
    | 'fantasy'
    | 'system-ui'
    | 'ui-serif'
    | 'ui-sans-serif'
    | 'ui-monospace'
    | 'ui-rounded'
    | 'emoji'
    | 'math'
    | 'fangsong';
};
