import { IErrorStore } from './declaration';

class ErrorStore implements IErrorStore {
  readonly init = (): void => {};

  readonly error = (): void => {};
}

export default ErrorStore;
