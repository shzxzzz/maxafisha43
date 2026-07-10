import { observer } from 'mobx-react';
import * as React from 'react';
import { useLocation } from 'react-router';

import { SearchInput } from 'components/common';
import { TRouteState } from 'config/router';
import { useCategoryPageStore } from 'store/locals/CategoryPageStore';

import s from './ServiceSearch.module.scss';

const ServiceSearch: React.FC = () => {
  const { state } = useLocation() as { state: TRouteState | null };
  const {
    filtersStore: { searchQuery },
  } = useCategoryPageStore();

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      searchQuery.setValue(e.target.value);
    },
    [searchQuery]
  );

  return (
    <div className={s.root}>
      <SearchInput
        placeholder="Найти"
        value={searchQuery.value}
        onChange={handleChange}
        autoFocus={state?.autoFocusSearch}
      />
    </div>
  );
};

export default observer(ServiceSearch);
