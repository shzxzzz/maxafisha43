import type { NavigateOptions } from 'react-router';

import { TRouteState } from 'config/router';

export type TNavigationDirection = 'forward' | 'back';

export type TNavigateOptions = {
  navigateOptions?: NavigateOptions;
  dynamicParams?: Record<string, string | number>;
  state?: TRouteState;
};
