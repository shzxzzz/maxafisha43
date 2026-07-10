import { Spinner } from '@maxhub/max-ui';
import { observer } from 'mobx-react';
import * as React from 'react';

import s from './ScreenSpinner.module.scss';

const ScreenSpinner: React.FC = () => {
  return (
    <div className={s.screen}>
      <Spinner appearance="themed" size={50} />
    </div>
  );
};

export default observer(ScreenSpinner);
