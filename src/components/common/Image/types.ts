import { TBreakpoint } from 'config/breakpoints';

export type TImageSrc = {
  /** Оригинальное изображение в формате JPEG или PNG,
   * будет использовано в браузерах, где отсутствует поддержка webp**/
  original: string;

  /** Изображение в прогрессивном формате WebP **/
  webp: string;
};

/** Набор изображений для разной плотности пикселей  */
export type TImagePixelDensityVariants = {
  ['1x']: TImageSrc;
  ['2x']: TImageSrc;
};

export type TImageBreakpointVariants = Partial<Record<TBreakpoint, TImagePixelDensityVariants>> &
  Pick<Record<TBreakpoint, TImagePixelDensityVariants>, 'desktop' | 'mobile'>;

export type TPictureAssets = TImagePixelDensityVariants | TImageBreakpointVariants;
