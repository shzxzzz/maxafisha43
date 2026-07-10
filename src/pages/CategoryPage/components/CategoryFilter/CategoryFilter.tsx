import { observer } from 'mobx-react';
import * as React from 'react';

import { ChipsTrack } from 'components/standalone/ChipsTrack';
import { ChipsWrap } from 'components/standalone/ChipsWrap';
import { CATEGORY_FILTER_CHIP_ITEMS, useCategoryPageStore } from 'store/locals/CategoryPageStore';

import s from './CategoryFilter.module.scss';

const CategoryFilter: React.FC = () => {
  const {
    filtersStore: { activeFilterId, selectCategory },
  } = useCategoryPageStore();

  return (
    <>
      <div className={s.carousel}>
        <ChipsTrack
          className={s.root}
          activeChipClassName={s.root__chip_active}
          variant="secondary"
          items={CATEGORY_FILTER_CHIP_ITEMS}
          activeId={activeFilterId}
          onItemClick={selectCategory}
          slidesOffset={12}
        />
      </div>
      <div className={s.wrap}>
        <ChipsWrap
          className={s.root}
          activeChipClassName={s.root__chip_active}
          variant="secondary"
          items={CATEGORY_FILTER_CHIP_ITEMS}
          activeId={activeFilterId}
          onItemClick={selectCategory}
          horizontalPadding={12}
        />
      </div>
    </>
  );
};

export default observer(CategoryFilter);
