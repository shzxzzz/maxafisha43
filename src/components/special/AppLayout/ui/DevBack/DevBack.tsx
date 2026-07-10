import { observer } from 'mobx-react';
import * as React from 'react';

import { useAppParamsStore } from 'store/hooks';

import s from './DevBack.module.scss';

type TProps = {
  onClick: VoidFunction;
};

const DevBack: React.FC<TProps> = ({ onClick }) => {
  const { isDev } = useAppParamsStore();

  if (!isDev) {
    return null;
  }

  return (
    <div className={s.root} onClick={onClick}>
      &lt;
    </div>
  );
};

export default observer(DevBack);
