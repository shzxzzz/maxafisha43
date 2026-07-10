import { createContextLocalStore } from 'utils/createContextLocalStore';

import { CategoryPageStore } from './CategoryPageStore';

export const { Provider: CategoryPageStoreProvider, useStore: useCategoryPageStore } =
  createContextLocalStore(CategoryPageStore);
