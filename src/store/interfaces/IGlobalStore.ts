import { IRootStore } from 'store/globals/root/declarations';

export interface IGlobalStore {
  readonly rootStore: IRootStore;

  init: (...args: any[]) => Promise<boolean>;

  destroy: VoidFunction;
}
