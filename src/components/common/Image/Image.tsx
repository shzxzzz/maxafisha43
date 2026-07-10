import * as React from 'react';

import { BREAKPOINTS } from 'config/breakpoints';

import s from './Image.module.scss';
import { TPictureAssets } from './types';
import { renderBreakpointSources } from './utils';

type TProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: TPictureAssets;
};

const Image: React.FC<TProps> = ({ src, className, ...props }) => {
  const isResponsive = 'desktop' in src;
  const fallbackSrc = isResponsive ? src.desktop['2x'].original : src['2x'].original;

  return (
    <picture className={className}>
      {isResponsive
        ? BREAKPOINTS.flatMap((bp) => {
            const images = src[bp];

            return images ? [renderBreakpointSources({ key: bp, breakpoint: bp, images })] : [];
          })
        : renderBreakpointSources({ images: src })}
      <img {...props} src={fallbackSrc} className={s.img} />
    </picture>
  );
};

export default React.memo(Image);
