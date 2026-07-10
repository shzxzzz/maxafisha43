import * as React from 'react';

import { Typography } from 'components/common';

import s from './ServiceDescription.module.scss';

type TProps = {
  description: string;
};

const ServiceDescription: React.FC<TProps> = ({ description }) => {
  return (
    <div className={s.root}>
      <Typography tag="body" size="large">
        {description}
      </Typography>
    </div>
  );
};

export default React.memo(ServiceDescription);
