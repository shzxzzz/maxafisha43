import cx from 'clsx';
import * as React from 'react';

import { TCategory } from 'types/config';

import { AllServicesGridTile } from './AllServicesGridTile';
import { CategoryCard } from './CategoryCard';
import s from './CategoryGrid.module.scss';
import { getGridMod } from './utils';

type TProps = {
  categories: TCategory[];
  onCategoryClick: (categoryId: string) => void;
  onAllServicesClick?: () => void;
};

const CategoryGrid: React.FC<TProps> = ({ categories, onCategoryClick, onAllServicesClick }) => {
  const visible = categories.slice(0, 5);
  const hasAll = Boolean(onAllServicesClick);

  if (visible.length === 0 && !hasAll) {
    return null;
  }

  const mod = visible.length > 0 ? getGridMod(visible.length) : null;
  const is5WithAll = hasAll && visible.length === 5;

  return (
    <div className={s.root}>
      <div
        className={cx(
          s.root__grid,
          mod && s[`root__grid_${mod}`],
          hasAll && s.root__grid_hasAll,
          is5WithAll && s.root__grid_withAllServices
        )}
      >
        {visible.map((category) => (
          <CategoryCard key={category.id} category={category} onClick={onCategoryClick} />
        ))}
        {onAllServicesClick ? <AllServicesGridTile onClick={onAllServicesClick} /> : null}
      </div>
    </div>
  );
};

export default React.memo(CategoryGrid);
