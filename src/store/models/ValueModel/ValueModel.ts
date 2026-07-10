import { action, computed, makeObservable, observable } from 'mobx';

type TProtectedFields = '_value' | '_touched' | '_resetTouched';

export default class ValueModel<T = string> {
  protected _value: T;
  protected _touched = false;
  protected readonly _initialValue: T;

  constructor(value: T) {
    this._value = value;
    this._initialValue = value;

    makeObservable<ValueModel<T>, TProtectedFields>(this, {
      _value: observable,
      _touched: observable,

      value: computed,
      isEmpty: computed,
      touched: computed,

      setValue: action.bound,
      reset: action.bound,
      _resetTouched: action.bound,
    });
  }

  get value(): T {
    return this._value;
  }

  get touched(): boolean {
    return this._touched;
  }

  get isEmpty(): boolean {
    return (
      !this._value ||
      ((typeof this._value === 'string' || Array.isArray(this._value)) && !this._value.length)
    );
  }

  setValue(value: T): void {
    if (value === this._value) {
      return;
    }

    this._value = value;
    this._touched = true;
  }

  protected _resetTouched = (): void => {
    this._touched = false;
  };

  reset(): void {
    this.setValue(this._initialValue);
    this._resetTouched();
  }
}
