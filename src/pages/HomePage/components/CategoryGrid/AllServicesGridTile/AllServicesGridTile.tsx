import * as React from 'react';

import { Typography } from 'components/common';

import s from './AllServicesGridTile.module.scss';

type TProps = {
  onClick: VoidFunction;
};

const AllServicesGridTile: React.FC<TProps> = ({ onClick }) => (
  <div className={s.root} onClick={onClick}>
    <Typography tag="title" weight="medium" className={s.root__label}>
      Все сервисы
    </Typography>
  </div>
);

export default React.memo(AllServicesGridTile);
