import { computed, makeObservable } from 'mobx';

import { SNACKBAR_MESSAGES_CONFIG, TSnackbarMessageType } from 'config/snackbars';
import { ValueModel } from 'store/models/ValueModel';

import { ISnackbarStore } from './declarations';

class SnackbarStore implements ISnackbarStore {
  private readonly _message: ValueModel<TSnackbarMessageType | null> =
    new ValueModel<TSnackbarMessageType | null>(null);

  constructor() {
    makeObservable(this, {
      message: computed,
      isOpened: computed,
    });
  }

  get message(): TSnackbarMessageType | null {
    return this._message.value;
  }

  get isOpened(): boolean {
    return this._message.value !== null;
  }

  readonly open = (message?: TSnackbarMessageType): void => {
    this._message.setValue(message ?? SNACKBAR_MESSAGES_CONFIG.error);
  };

  readonly triggerDefaultErrorMessage = (): void => {
    this.open(SNACKBAR_MESSAGES_CONFIG.error);
  };

  readonly close = (): void => {
    this._message.setValue(null);
  };
}

export default SnackbarStore;
