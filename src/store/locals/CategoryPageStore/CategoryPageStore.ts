import { computed, makeObservable } from 'mobx';

import { TChipItem } from 'components/standalone/ChipsTrack';
import { regionConfig } from 'config/regionConfig';
import { IRootStore } from 'store/globals/root/declarations';
import { ILocalStore } from 'store/interfaces';
import ValueModel from 'store/models/ValueModel/ValueModel';

import { CategoryFiltersStore } from './CategoryFiltersStore';
import { ALL_CATEGORY_ID } from './CategoryFiltersStore/config';
import { filterByCategory } from './utils';

const { services, channels, categories } = regionConfig;

const allItems = [...services, ...channels];

const categoriesWithItems = categories.filter((cat) =>
  allItems.some((item) => item.category_ids?.includes(cat.id))
);

const ALL_SERVICES_LABEL = 'Все сервисы';

export const CATEGORY_FILTER_CHIP_ITEMS: TChipItem[] = [
  { id: ALL_CATEGORY_ID, label: 'Все' },
  ...categoriesWithItems.map((cat) => ({ id: cat.id, label: cat.name })),
];

type TPrivateFields = '_baseServices';

export class CategoryPageStore implements ILocalStore {
  readonly categoryId = new ValueModel<string | undefined>(undefined);
  readonly filtersStore: CategoryFiltersStore;

  constructor(
    categoryId: string | undefined,
    initialQuery: string | undefined,
    rootStore: IRootStore,
    initialSelectedCategoryId?: string
  ) {
    this.categoryId.setValue(categoryId);

    const { sendSearchQuery, sendSearchEmpty } = rootStore.analyticsStore;

    this.filtersStore = new CategoryFiltersStore({
      getBaseItems: () => this._baseServices,
      initialQuery,
      initialSelectedCategoryId,
      onSearch: sendSearchQuery,
      onSearchEmpty: sendSearchEmpty,
    });

    makeObservable<CategoryPageStore, TPrivateFields>(this, {
      _baseServices: computed,
    });
  }

  get isAllCategories(): boolean {
    return !this.categoryId.value;
  }

  get categoryName(): string {
    if (this.categoryId.value) {
      const cat = categories.find((c) => c.id === this.categoryId.value);

      return cat?.name ?? '';
    }

    return ALL_SERVICES_LABEL;
  }

  private get _baseServices() {
    return this.categoryId.value ? filterByCategory(allItems, this.categoryId.value) : allItems;
  }

  destroy = (): void => {
    this.categoryId.reset();
    this.filtersStore.destroy();
  };
}
