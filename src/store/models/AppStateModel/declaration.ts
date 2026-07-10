export interface IAppStateModel {
  initial: boolean;
  loading: boolean;
  loadedSuccessfully: boolean;
  loadedWithError: boolean;

  reset: () => void;
  setLoading: () => void;
  setLoadedSuccessfully: () => void;
  setLoadedWithError: () => void;
}
