import * as React from 'react';

import { Typography } from 'components/common';

import s from './ServiceTags.module.scss';

type TProps = {
  tags: string[];
};

const ServiceTags: React.FC<TProps> = ({ tags }) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={s.root}>
      <Typography tag="label" size="large" color="secondary" className={s.root__title}>
        Теги для поиска
      </Typography>
      <div className={s.root__tags}>
        <Typography tag="title" size="small" color="secondary">
          {tags.join(', ')}
        </Typography>
      </div>
    </div>
  );
};

export default React.memo(ServiceTags);
