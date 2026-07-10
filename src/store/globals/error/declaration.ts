import { TCommonErrorData } from './types';

export interface IErrorStore {
  readonly init: () => void;
  readonly error: (error: unknown, data?: TCommonErrorData) => void;
}
