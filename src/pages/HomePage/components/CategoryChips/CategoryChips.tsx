import * as React from 'react';

import { ChipsTrack } from 'components/standalone/ChipsTrack';
import { ChipsWrap } from 'components/standalone/ChipsWrap';
import { TCategory } from 'types/config';

import s from './CategoryChips.module.scss';

type TProps = {
  categories: TCategory[];
  onCategoryClick: (categoryId: string) => void;
};

const CategoryChips: React.FC<TProps> = ({ categories, onCategoryClick }) => {
  const items = React.useMemo(
    () => categories.map((cat) => ({ id: cat.id, label: cat.name })),
    [categories]
  );

  return (
    <>
      <div className={s.carousel}>
        <ChipsTrack items={items} onItemClick={onCategoryClick} />
      </div>
      <div className={s.wrap}>
        <ChipsWrap items={items} onItemClick={onCategoryClick} />
      </div>
    </>
  );
};

export default React.memo(CategoryChips);
