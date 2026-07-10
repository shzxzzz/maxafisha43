import { TSnackbarMessageType } from 'config/snackbars';

export interface ISnackbarStore {
  message: TSnackbarMessageType | null;

  isOpened: boolean;

  open: (message?: TSnackbarMessageType) => void;

  triggerDefaultErrorMessage: () => void;

  close: () => void;
}
