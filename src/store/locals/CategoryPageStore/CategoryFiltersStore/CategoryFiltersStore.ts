import { action, computed, IReactionDisposer, makeObservable, observable, reaction } from 'mobx';

import { ILocalStore } from 'store/interfaces';
import ValueModel from 'store/models/ValueModel/ValueModel';
import { TServiceItem } from 'types/config';

import { ALL_CATEGORY_ID, MIN_SEARCH_LENGTH, searchItems, sortByPriority } from './config';

const SEARCH_DEBOUNCE_MS = 300;

export type TCategoryFiltersStoreOptions = {
  getBaseItems: () => TServiceItem[];
  initialQuery?: string;
  initialSelectedCategoryId?: string;
  onSearch?: (query: string) => void;
  onSearchEmpty?: (query: string) => void;
};

type TPrivateFields = '_debouncedQuery' | '_searchFiltered';

export class CategoryFiltersStore implements ILocalStore {
  readonly searchQuery = new ValueModel('');
  readonly selectedCategoryId = new ValueModel<string | undefined>(undefined);

  private _debouncedQuery = '';
  private readonly _getBaseItems: () => TServiceItem[];
  private readonly _onSearch?: (query: string) => void;
  private readonly _onSearchEmpty?: (query: string) => void;
  private readonly _disposers: IReactionDisposer[] = [];

  constructor(options: TCategoryFiltersStoreOptions) {
    this._getBaseItems = options.getBaseItems;
    this._onSearch = options.onSearch;
    this._onSearchEmpty = options.onSearchEmpty;

    if (options.initialQuery) {
      this.searchQuery.setValue(options.initialQuery);
      this._debouncedQuery = options.initialQuery.trim().toLowerCase();
    }

    if (options.initialSelectedCategoryId) {
      this.selectedCategoryId.setValue(options.initialSelectedCategoryId);
    }

    makeObservable<CategoryFiltersStore, TPrivateFields>(this, {
      _debouncedQuery: observable,
      _searchFiltered: computed,
      filteredItems: computed,
      activeFilterId: computed,
      selectCategory: action,
    });

    this._disposers.push(
      reaction(
        () => this.searchQuery.value,
        (query) => {
          const timerId = setTimeout(
            action(() => {
              this._debouncedQuery = query.trim().toLowerCase();
            }),
            SEARCH_DEBOUNCE_MS
          );

          return () => clearTimeout(timerId);
        },
        { fireImmediately: true }
      )
    );

    this._initSearchTracking();
  }

  get activeFilterId(): string {
    return this.selectedCategoryId.value ?? ALL_CATEGORY_ID;
  }

  selectCategory = (id: string): void => {
    if (id === ALL_CATEGORY_ID) {
      this.selectedCategoryId.setValue(undefined);

      return;
    }

    const next = this.selectedCategoryId.value === id ? undefined : id;

    this.selectedCategoryId.setValue(next);
  };

  get filteredItems(): TServiceItem[] {
    const filtered = this.selectedCategoryId.value
      ? this._searchFiltered.filter((item) =>
          item.category_ids?.includes(this.selectedCategoryId.value!)
        )
      : this._searchFiltered;

    return filtered.slice().sort(sortByPriority);
  }

  private get _searchFiltered(): TServiceItem[] {
    if (this._debouncedQuery.length < MIN_SEARCH_LENGTH) {
      return this._getBaseItems();
    }

    return searchItems(this._getBaseItems(), this._debouncedQuery);
  }

  private _initSearchTracking(): void {
    if (!this._onSearch) {
      return;
    }

    this._disposers.push(
      reaction(
        () => this._debouncedQuery,
        () => {
          const query = this.searchQuery.value.trim();

          if (query.length < MIN_SEARCH_LENGTH) {
            return;
          }

          this._onSearch?.(query);

          if (this.filteredItems.length === 0) {
            this._onSearchEmpty?.(query);
          }
        }
      )
    );
  }

  destroy = (): void => {
    this._disposers.forEach((dispose) => dispose());
    this.searchQuery.reset();
    this.selectedCategoryId.reset();
  };
}
