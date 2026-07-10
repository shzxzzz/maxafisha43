import cx from 'clsx';
import { type HTMLMotionProps, motion } from 'framer-motion';
import { observer } from 'mobx-react';
import * as React from 'react';

import * as config from 'components/special/AppLayout/config';
import { TNavigationDirection } from 'store/globals/router/types';

import s from './PageWrapper.module.scss';

type TProps = TDefaultProps & {
  animationConfig?: HTMLMotionProps<'div'>;
  direction?: TNavigationDirection;
};

const PageWrapper = React.forwardRef<HTMLDivElement, TProps>(
  ({ className, children, animationConfig, direction = 'forward' }, ref) => {
    const motionProps: HTMLMotionProps<'div'> = animationConfig ?? {
      custom: direction,
      variants: config.PAGE_SLIDE_VARIANTS,
      initial: 'initial',
      animate: 'animate',
      exit: 'exit',
      transition: config.PAGE_SLIDE_TRANSITION,
    };

    return (
      <motion.div ref={ref} className={cx(s['full-page'], className)} {...motionProps}>
        {children}
      </motion.div>
    );
  }
);

export default observer(PageWrapper);
