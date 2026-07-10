import { type TRootStoreType, useRootStore } from 'store/globals/root';

type TSubStore<S extends keyof TRootStoreType> = S extends `${string}Store` ? S : never;

const createSubStoreHook = <S extends keyof TRootStoreType>(
  storeName: TSubStore<S>
): (() => TRootStoreType[S]) => {
  const getError = () => new Error(`"${storeName}" not found!`);

  return () => {
    try {
      const store = useRootStore()[storeName];

      if (!store) {
        throw getError();
      }

      return store;
    } catch (error) {
      throw getError();
    }
  };
};

export const useAppParamsStore = createSubStoreHook('appParamsStore');

export const useRouterStore = createSubStoreHook('routerStore');

export const useSnackbarStore = createSubStoreHook('snackbarStore');

export const useAnalyticsStore = createSubStoreHook('analyticsStore');

export const useErrorStore = createSubStoreHook('errorStore');
