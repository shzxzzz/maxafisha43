import { action, computed, makeObservable, observable } from 'mobx';

import { IAppStateModel } from './declaration';

const enum EAppStateEnum {
  INITIAL,
  LOADING,
  LOADED_SUCCESSFULLY,
  LOADED_WITH_ERROR,
}

type TPrivateFields = '_state' | '_setState';

export class AppStateModel implements IAppStateModel {
  private _state = EAppStateEnum.INITIAL;

  constructor() {
    makeObservable<this, TPrivateFields>(this, {
      _state: observable,
      _setState: action.bound,

      initial: computed,
      loading: computed,
      loadedSuccessfully: computed,
      loadedWithError: computed,
    });
  }

  get initial(): boolean {
    return this._state === EAppStateEnum.INITIAL;
  }

  get loading(): boolean {
    return this._state === EAppStateEnum.LOADING;
  }

  get loadedSuccessfully(): boolean {
    return this._state === EAppStateEnum.LOADED_SUCCESSFULLY;
  }

  get loadedWithError(): boolean {
    return this._state === EAppStateEnum.LOADED_WITH_ERROR;
  }

  private readonly _setState = (state: EAppStateEnum) => {
    this._state = state;
  };

  readonly reset = (): void => {
    this._setState(EAppStateEnum.INITIAL);
  };

  readonly setLoading = (): void => {
    this._setState(EAppStateEnum.LOADING);
  };

  readonly setLoadedSuccessfully = (): void => {
    this._setState(EAppStateEnum.LOADED_SUCCESSFULLY);
  };

  readonly setLoadedWithError = (): void => {
    this._setState(EAppStateEnum.LOADED_WITH_ERROR);
  };
}
