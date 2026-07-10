import { NavigateFunction, NavigateOptions } from 'react-router';

import { ERoutePath } from 'config/router';
import { TNavigateOptions } from 'store/globals/router/types';

export interface IRouterStore {
  readonly init: (navigate: NavigateFunction) => Promise<boolean>;
  readonly destroy: () => void;
  readonly push: (to: ERoutePath, options?: TNavigateOptions) => void;
  readonly replaceWithReset: (to: ERoutePath, options?: NavigateOptions) => void;
  readonly replace: (to: ERoutePath, options?: TNavigateOptions) => void;
  readonly goBack: () => void;
  readonly setHash: (hash: string) => void;
}
