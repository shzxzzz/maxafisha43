import { IAnalyticsAdapter } from '../types';

import './types';

export class MyTrackerAdapter implements IAnalyticsAdapter {
  constructor(private readonly _trackerId: string) {}

  readonly init = (): void => {
    window._tmr = window._tmr || [];

    window._tmr.push({
      id: this._trackerId,
      type: 'pageView',
      start: new Date().getTime(),
    });

    const d = document;
    const id = 'tmr-code';

    if (!d.getElementById(id)) {
      const ts = d.createElement('script');

      ts.type = 'text/javascript';
      ts.async = true;
      ts.id = id;
      ts.src = 'https://top-fwz1.mail.ru/js/code.js';

      const s = d.getElementsByTagName('script')[0];

      s.parentNode?.insertBefore(ts, s);
    }

    window._tmr.push({
      id: this._trackerId,
      type: 'onready',
    });
  };

  readonly sendPage = (url: string): void => {
    window._tmr.push({
      id: this._trackerId,
      type: 'pageView',
      url,
    });
  };

  readonly sendEvent = (event: string, params?: Record<string, unknown>): void => {
    window._tmr.push({
      id: this._trackerId,
      type: 'reachGoal',
      goal: event,
      params,
    });
  };
}
