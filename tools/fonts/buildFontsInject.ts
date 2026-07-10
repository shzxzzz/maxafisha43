import { FONTS } from './config';
import { getFontPreloadLinksBuilder, getFontFaceCSSBuilder, TFontBuilderProps } from './utils';

export const buildFontsInject = (
  params: TFontBuilderProps = {}
): {
  INJECT_FONTS_PRELOAD_LINKS: string;
  INJECT_FONTS_FACES: string;
} => {
  const buildFontFace = getFontFaceCSSBuilder(params);
  const buildPreloadLinks = getFontPreloadLinksBuilder({ ...params, preloadFormats: ['woff2'] });

  const INJECT_FONTS_PRELOAD_LINKS = FONTS.map(buildPreloadLinks).join('\n');

  const INJECT_FONTS_FACES = FONTS.map(buildFontFace).join('\n');

  return {
    INJECT_FONTS_PRELOAD_LINKS,
    INJECT_FONTS_FACES,
  };
};
