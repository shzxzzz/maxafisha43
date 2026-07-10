import { IAppStateModel } from 'store/models/AppStateModel/declaration';

import { IAnalyticsStore } from '../analytics/declaration';
import { IAppParamsStore } from '../appParams/declarations';
import { IErrorStore } from '../error/declaration';
import { IRouterStore } from '../router/declarations';
import { ISnackbarStore } from '../snackbar/declarations';

import { TRootStoreInitProps } from './types';

export interface IRootStore {
  readonly appState: IAppStateModel;
  readonly appParamsStore: IAppParamsStore;
  readonly routerStore: IRouterStore;
  readonly snackbarStore: ISnackbarStore;
  readonly analyticsStore: IAnalyticsStore;
  readonly errorStore: IErrorStore;
  readonly reload: () => void;
  readonly init: (initProps: TRootStoreInitProps) => Promise<boolean>;
  readonly destroy: () => void;
}
