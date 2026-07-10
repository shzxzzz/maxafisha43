import * as React from 'react';

import { Typography } from 'components/common';
import { resolveIconUrl } from 'config/regionConfig';
import { TCategory } from 'types/config';

import s from './CategoryCard.module.scss';

type TProps = {
  category: TCategory;
  onClick: (categoryId: string) => void;
};

const CategoryCard: React.FC<TProps> = ({ category, onClick }) => {
  const iconUrl = resolveIconUrl(category.icon, 'categories');

  const handleClick = React.useCallback(() => {
    onClick(category.id);
  }, [onClick, category.id]);

  return (
    <div className={s.root} onClick={handleClick}>
      <img src={iconUrl} alt={category.name} className={s['root__icon-image']} />
      <Typography tag="title" weight="medium" className={s.root__name}>
        {category.name}
      </Typography>
    </div>
  );
};

export default React.memo(CategoryCard);
