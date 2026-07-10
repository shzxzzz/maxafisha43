import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { ValueModel } from '../ValueModel';

import { ITimerModel } from './declarations';

const TIMER_TICK_MS = 1000;

export class TimerModel implements ITimerModel {
  /** базовая длительность таймера, в миллисекундах */
  initialTime: number;

  /** текущее оставшееся время, в миллисекундах */
  time: number;

  /** Ф-ия, вызывающаяся по завершении таймера **/
  onTimerUp: VoidFunction;

  isRunning = false;

  /** Версия анимации — инкрементируется при start, reset, addTime, subtractTime */
  private readonly _animationVersion = new ValueModel(0);

  isPaused = false;

  private _intervalId: ReturnType<typeof setInterval> | null = null;

  private _deadline: number | null = null;

  constructor(initialTime: number, onTimerUp: VoidFunction) {
    this.initialTime = initialTime;
    this.time = initialTime;
    this.onTimerUp = onTimerUp;

    makeObservable(this, {
      initialTime: observable,
      time: observable,
      isRunning: observable,
      isPaused: observable,

      timeLeft: computed,
      isFinished: computed,
      formattedTimeLeft: computed,
      animationVersion: computed,

      start: action,
      stop: action,
      pause: action,
      resume: action,
      reset: action,
      changeInitialTime: action,
      addTime: action,
      subtractTime: action,
    });
  }

  get timeLeft(): number {
    return this.time;
  }

  get isFinished(): boolean {
    return this.time <= 0;
  }

  get formattedTimeLeft(): string {
    const secondsLeft = Math.ceil(this.time / 1000);

    return `${Math.max(secondsLeft, 0)} сек`;
  }

  get animationVersion(): number {
    return this._animationVersion.value;
  }

  readonly start = () => {
    if (this.isRunning) {
      return;
    }

    this._clearInterval();

    this.isRunning = true;
    this.isPaused = false;
    this._deadline = performance.now() + this.time;
    this._incrementAnimationVersion();

    this._intervalId = setInterval(this._tick, TIMER_TICK_MS);
  };

  private readonly _tick = () => {
    if (!this.isRunning || this.isPaused || this._deadline === null) {
      return;
    }

    const left = Math.max(this._deadline - performance.now(), 0);

    runInAction(() => {
      this.time = left;

      if (left <= 0) {
        this.stop();
        this.onTimerUp();
      }
    });
  };

  readonly stop = () => {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    this.isPaused = false;
    this._deadline = null;
    this._clearInterval();
  };

  readonly pause = () => {
    if (!this.isRunning || this.isPaused) {
      return;
    }

    // Сохраняем оставшееся время, чтобы корректно восстановить таймер
    if (this._deadline !== null) {
      this.time = Math.max(this._deadline - performance.now(), 0);
    }

    this.isPaused = true;
    this._deadline = null;
    this._clearInterval();
  };

  readonly resume = () => {
    if (!this.isRunning || !this.isPaused) {
      return;
    }

    this._clearInterval();

    this.isPaused = false;
    this._deadline = performance.now() + this.time;
    this._intervalId = setInterval(this._tick, TIMER_TICK_MS);
  };

  readonly reset = () => {
    this.stop();
    this.time = this.initialTime;
    this._incrementAnimationVersion();
  };

  readonly changeInitialTime = (newInitialTime: number) => {
    this.initialTime = newInitialTime;
    this.reset();
  };

  readonly addTime = (deltaMs: number) => {
    this._shiftTime(deltaMs);
  };

  readonly subtractTime = (deltaMs: number) => {
    this._shiftTime(-deltaMs);
  };

  /** Время таймера со сдвигом не должно превышать исходное время **/
  private readonly _clamp = (ms: number): number => Math.min(Math.max(ms, 0), this.initialTime);

  private readonly _shiftTime = (deltaMs: number) => {
    const wasFinished = this.time <= 0;
    const now = performance.now();

    if (this.isRunning && !this.isPaused && this._deadline !== null) {
      const leftNow = Math.max(this._deadline - now, 0);
      const nextLeft = this._clamp(leftNow + deltaMs);

      this._deadline = now + nextLeft;
      this.time = nextLeft;
    } else {
      this.time = this._clamp(this.time + deltaMs);
    }

    this._incrementAnimationVersion();

    if (!wasFinished && this.time <= 0) {
      this.stop();
      this.onTimerUp();
    }
  };

  private readonly _clearInterval = () => {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  };

  private readonly _incrementAnimationVersion = () => {
    this._animationVersion.setValue(this._animationVersion.value + 1);
  };

  destroy = () => {
    this._clearInterval();
  };
}
