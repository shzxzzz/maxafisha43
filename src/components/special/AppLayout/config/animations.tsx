import { type HTMLMotionProps, type Variants } from 'framer-motion';

import { TNavigationDirection } from 'store/globals/router/types';

export const APP_LOADER_ANIMATION_PROPS: HTMLMotionProps<'div'> = {
  initial: {
    opacity: 0,
    position: 'fixed',
    pointerEvents: 'none',
  },
  animate: {
    opacity: 1,
    position: 'initial',
    pointerEvents: 'initial',
  },
  exit: {
    opacity: 0,
    position: 'fixed',
    pointerEvents: 'none',
  },
  transition: {
    duration: 0.25,
  },
};

export const PAGE_SLIDE_VARIANTS: Variants = {
  initial: (direction: TNavigationDirection) => ({
    x: direction === 'back' ? '-100%' : '100%',
    opacity: 0,
    position: 'fixed',
    pointerEvents: 'none',
  }),
  animate: {
    x: 0,
    opacity: 1,
    position: 'initial',
    pointerEvents: 'initial',
  },
  exit: (direction: TNavigationDirection) => ({
    x: direction === 'back' ? '100%' : '-100%',
    opacity: 0,
    position: 'fixed',
    pointerEvents: 'none',
  }),
};

export const PAGE_SLIDE_TRANSITION = { duration: 0.5 };
