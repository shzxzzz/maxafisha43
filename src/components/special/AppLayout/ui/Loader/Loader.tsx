import cx from 'clsx';
import { observer } from 'mobx-react';
import * as React from 'react';

import { ScreenSpinner } from 'components/common';
import * as config from 'components/special/AppLayout/config';

import { PageWrapper } from '../PageWrapper';

import s from './Loader.module.scss';

type TProps = TPropsWithClassName;

const Loader = React.forwardRef<HTMLDivElement, TProps>(({ className }, ref) => {
  return (
    <PageWrapper
      ref={ref}
      className={cx(s['loader-page'], className)}
      animationConfig={config.APP_LOADER_ANIMATION_PROPS}
    >
      <ScreenSpinner />
    </PageWrapper>
  );
});

export default observer(Loader);
