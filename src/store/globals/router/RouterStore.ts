import { IReactionDisposer } from 'mobx';
import { NavigateFunction, type NavigateOptions } from 'react-router';

import { ERoutePath } from 'config/router';
import { IGlobalStore } from 'store/interfaces';

import { IRootStore } from '../root/declarations';

import { IRouterStore } from './declarations';
import { TNavigateOptions } from './types';

export class RouterStore implements IGlobalStore, IRouterStore {
  private _navigate: NavigateFunction | null = null;
  private _reactions: IReactionDisposer[] = [];
  constructor(public readonly rootStore: IRootStore) {}

  readonly init = (navigate: NavigateFunction): Promise<boolean> => {
    this._navigate = navigate;

    return Promise.resolve(true);
  };

  readonly destroy = (): void => {
    this._reactions.forEach((dispose) => dispose());
  };

  readonly push = (to: ERoutePath, options?: TNavigateOptions) => {
    this._navigateToRoute(to, options);
  };

  /**
   * Заменяет текущий маршрут без добавления в историю и сбрасывает счётчик вложенности.
   *
   * @param to - Новый маршрут, на который нужно перейти.
   * @param options - Дополнительные параметры навигации.
   */
  readonly replaceWithReset = (to: ERoutePath, options?: NavigateOptions) => {
    this._navigate?.(to, {
      ...options,
      replace: true,
    });
  };

  readonly replace = (to: ERoutePath, options?: TNavigateOptions) => {
    this._navigateToRoute(to, {
      ...options,
      isReplace: true,
    });
  };

  readonly goBack = () => {
    this._navigate?.(-1);
  };

  readonly setHash = (hash: string) => {
    history.replaceState(null, '', `${window.location.pathname}#${hash}`);
  };

  private readonly _navigateToRoute = (
    to: ERoutePath,
    options?: TNavigateOptions & {
      isReplace?: boolean;
    }
  ) => {
    const path = options?.dynamicParams
      ? this._replaceDynamicPathParams(to, options.dynamicParams)
      : to;

    this._navigate?.(path, {
      ...options?.navigateOptions,
      state: options?.state,
      replace: options?.isReplace,
    });
  };

  private readonly _replaceDynamicPathParams = (
    path: ERoutePath,
    params: Record<string, string | number>
  ): string => {
    return path.split('/').reduce((acc: string, part: string) => {
      if (part.startsWith(':')) {
        const paramName = part.slice(1);

        return acc.replace(part, params[paramName]?.toString() ?? '');
      }

      return acc;
    }, path);
  };
}
