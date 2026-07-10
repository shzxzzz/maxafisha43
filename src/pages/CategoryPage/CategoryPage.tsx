import { observer } from 'mobx-react';
import * as React from 'react';
import { useLocation, useParams } from 'react-router';

import { Page, Typography } from 'components/common';
import { ScrollToTopButton } from 'components/standalone/ScrollToTopButton';
import { ERoutePath, TRouteState } from 'config/router';
import { useRootStore } from 'store/globals/root';
import { useLocalStore, useRouterStore } from 'store/hooks';
import { CategoryPageStore, CategoryPageStoreProvider } from 'store/locals/CategoryPageStore';

import s from './CategoryPage.module.scss';
import { CategoryFilter } from './components/CategoryFilter';
import { ServiceList } from './components/ServiceList';
import { ServiceSearch } from './components/ServiceSearch';

const CategoryPage: React.FC = observer(() => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { state } = useLocation() as { state: TRouteState | null };
  const initialQuery = state?.searchQuery;
  const initialSelectedCategoryId = state?.selectedCategoryId;
  const rootStore = useRootStore();
  const store = useLocalStore(
    () => new CategoryPageStore(categoryId, initialQuery, rootStore, initialSelectedCategoryId),
    [categoryId]
  );
  const {
    categoryName,
    isAllCategories,
    filtersStore: { filteredItems },
  } = store;
  const { push, replace } = useRouterStore();

  const {
    analyticsStore: { sendServiceClick },
  } = rootStore;

  const handleServiceClick = React.useCallback(
    (serviceId: string) => {
      sendServiceClick(serviceId, categoryId);

      const currentPath = categoryId ? ERoutePath.category : ERoutePath.categories;
      const searchQuery = store.filtersStore.searchQuery.value || undefined;
      const selectedCatId = store.filtersStore.selectedCategoryId.value;

      replace(currentPath, {
        ...(categoryId ? { dynamicParams: { categoryId } } : undefined),
        state: { searchQuery, selectedCategoryId: selectedCatId },
      });

      push(ERoutePath.service, { dynamicParams: { serviceId } });
    },
    [push, replace, categoryId, sendServiceClick, store.filtersStore]
  );

  return (
    <CategoryPageStoreProvider store={store}>
      <Page shouldSendPageStat className={s.root}>
        <Typography className={s.root__header} tag="headline" size="large" weight="strong">
          {categoryName}
        </Typography>
        <ServiceSearch />
        {isAllCategories && <CategoryFilter />}
        <ServiceList services={filteredItems} onServiceClick={handleServiceClick} />
        <ScrollToTopButton />
      </Page>
    </CategoryPageStoreProvider>
  );
});

export default CategoryPage;
