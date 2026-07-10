export interface IAnalyticsAdapter {
  readonly init: () => void;
  readonly sendPage: (url: string) => void;
  readonly sendEvent: (event: string, params?: Record<string, unknown>) => void;
}
