import { TPictureAssets } from 'components/common';
import { BREAKPOINTS, BREAKPOINTS_MAX_WIDTH, TBreakpoint } from 'config/breakpoints';
import noop from 'utils/noop.ts';

import baseLoadImages from './loadImages';

/**
 * Проверяет поддержку формата WebP браузером
 * @returns {Promise<boolean>} true если WebP поддерживается
 */
const checkWebPSupport = (): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    const img = new Image();

    img.onload = () => {
      resolve(img.height === 2);
    };

    img.onerror = () => {
      resolve(false);
    };

    // Минимальная валидная WebP картинка 2x2 пикселя
    img.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Определяет плотность пикселей экрана
 * @returns {'1x' | '2x'} Плотность пикселей (приводится к 1x или 2x)
 */
const getPixelDensity = (): '1x' | '2x' => {
  // Если DPR > 1, загружаем 2x, иначе 1x
  return window.devicePixelRatio > 1 ? '2x' : '1x';
};

/**
 * Определяет текущий breakpoint на основе ширины окна
 * @returns {TBreakpoint} Текущий breakpoint (mobile, tablet, desktop)
 */
const getCurrentBreakpoint = (): TBreakpoint => {
  const width = window.innerWidth;

  for (const breakpoint of BREAKPOINTS) {
    const maxWidth = BREAKPOINTS_MAX_WIDTH[breakpoint];

    if (maxWidth !== undefined && width <= maxWidth) {
      return breakpoint;
    }
  }

  return 'desktop';
};

type TPreloadImagesParams = {
  images?: string[];
  pictureAssets?: TPictureAssets[];
  onNextLoaded?: VoidFunction;
};

/**
 * Предзагружает изображения
 *
 * Обертка над loadImages из @kts-specials/mediaproject-utils, которая:
 * - Определяет поддержку WebP браузером
 * - Определяет плотность пикселей экрана (1x или 2x)
 * - Определяет текущий breakpoint (mobile, tablet, desktop)
 * - Загружает только подходящие изображения
 *
 * @param {TPreloadImagesParams} params
 * @returns {Promise<void>}
 */
export const preloadImages = async (params: TPreloadImagesParams = {}): Promise<void> => {
  const { images = [], pictureAssets = [], onNextLoaded = noop } = params;

  const imagesToLoad: string[] = [...images];

  if (pictureAssets?.length > 0) {
    const supportsWebP = await checkWebPSupport();
    const pixelDensity = getPixelDensity();
    const breakpoint = getCurrentBreakpoint();

    // выбираем только нужные изображения с учетом breakpoint, плотности пикселей и поддержки WebP
    const pictureImages = pictureAssets.reduce<string[]>((acc, asset) => {
      const variants = 'desktop' in asset ? (asset[breakpoint] ?? asset.desktop) : asset;
      const image = variants[pixelDensity] ?? variants['2x'];

      acc.push(supportsWebP ? image.webp : image.original);

      return acc;
    }, []);

    imagesToLoad.push(...pictureImages);
  }

  await baseLoadImages(imagesToLoad, onNextLoaded);
};
