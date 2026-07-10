import type { TFontProps } from './types';

export const FONTS: TFontProps[] = [
  {
    name: 'Max Sans',
    genericFamily: 'sans-serif',
    basePath: '/static/fonts/MaxSans',
    variants: [
      {
        fileNamePostfix: '-Regular',
        weight: 400,
      },
      {
        fileNamePostfix: '-Medium',
        weight: 500,
      },
    ],
    formats: ['ttf'],
    display: 'swap',
  },
  {
    name: 'SF Pro Text',
    genericFamily: 'sans-serif',
    basePath: '/static/fonts/SFProText',
    variants: [
      {
        fileNamePostfix: '-Regular',
        weight: 400,
      },
      {
        fileNamePostfix: '-Medium',
        weight: 500,
      },
      {
        fileNamePostfix: '-Semibold',
        weight: 600,
      },
    ],
    formats: ['woff2'],
    display: 'swap',
  },
  {
    name: 'VK Sans Display',
    genericFamily: 'sans-serif',
    basePath: 'https://public-data.hb.bizmrg.com/fonts/VKSansDisplay/VKSansDisplay',
    variants: [
      {
        fileNamePostfix: '-Medium',
        weight: 500,
      },
      {
        fileNamePostfix: '-DemiBold',
        weight: 600,
      },
    ],
    formats: ['woff2'],
    display: 'swap',
  },
];
