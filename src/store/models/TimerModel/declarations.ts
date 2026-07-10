export interface ITimerModel {
  readonly initialTime: number;
  readonly timeLeft: number;
  readonly isRunning: boolean;
  readonly isPaused: boolean;
  readonly isFinished: boolean;
  readonly formattedTimeLeft: string;
  readonly animationVersion: number;
}
