import * as React from 'react';

import { SearchInput } from 'components/common';
import { ERoutePath } from 'config/router';
import { useRouterStore } from 'store/hooks';

import s from './SearchBar.module.scss';

const SearchBar: React.FC = () => {
  const { push } = useRouterStore();

  const handleFocus = React.useCallback(() => {
    push(ERoutePath.categories, { state: { autoFocusSearch: true } });
  }, [push]);

  return (
    <div className={s.root}>
      <SearchInput placeholder="Найти сервис" value="" onFocus={handleFocus} />
    </div>
  );
};

export default React.memo(SearchBar);
