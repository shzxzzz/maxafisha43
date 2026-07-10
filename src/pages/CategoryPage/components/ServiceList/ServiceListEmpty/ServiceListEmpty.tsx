import * as React from 'react';

import { Typography } from 'components/common';

import s from './ServiceListEmpty.module.scss';

const ServiceListEmpty: React.FC = () => (
  <div className={s.root}>
    <Typography tag="title" size="small" color="secondary">
      Ничего не найдено
    </Typography>
  </div>
);

export default React.memo(ServiceListEmpty);
