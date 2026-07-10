import * as React from 'react';

import { BREAKPOINTS_MAX_WIDTH, TBreakpoint } from 'config/breakpoints';

import { TImagePixelDensityVariants } from './types';

type TBreakpointSource = {
  key?: string;
  images: TImagePixelDensityVariants;
  breakpoint?: TBreakpoint;
};

/** media query для breakpoint */
const getMediaQuery = (breakpoint: TBreakpoint): string | undefined => {
  const maxWidth = BREAKPOINTS_MAX_WIDTH[breakpoint];

  if (maxWidth === null) {
    return undefined;
  }

  return `(max-width: ${maxWidth}px)`;
};

/** Формирует строку srcSet для 1x и 2x */
const buildSrcSet = ({
  variant1x,
  variant2x,
}: {
  variant1x: string;
  variant2x: string;
}): string => {
  return `${variant1x} 1x, ${variant2x} 2x`;
};

/** source элементы для конкретного брейкпоинта */
export const renderBreakpointSources = (source: TBreakpointSource) => {
  const { images, breakpoint, key } = source;

  // для desktop media query добавлять не нужно
  const media = breakpoint && breakpoint !== 'desktop' ? getMediaQuery(breakpoint) : undefined;
  const webpSrcSet = buildSrcSet({ variant1x: images['1x']?.webp, variant2x: images['2x']?.webp });
  const originalSrcSet = buildSrcSet({
    variant1x: images['1x']?.original,
    variant2x: images['2x']?.original,
  });

  return (
    <React.Fragment key={key}>
      <source type="image/webp" srcSet={webpSrcSet} media={media} />
      <source srcSet={originalSrcSet} media={media} />
    </React.Fragment>
  );
};
