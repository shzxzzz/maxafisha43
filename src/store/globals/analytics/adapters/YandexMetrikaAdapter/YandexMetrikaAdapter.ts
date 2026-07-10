import { IAnalyticsAdapter } from '../types';

import { TYmFunction } from './types';

export class YandexMetrikaAdapter implements IAnalyticsAdapter {
  constructor(private readonly _counterId: string) {}

  readonly init = (): void => {
    const counterId = this._counterId;

    ((m: Window & typeof globalThis, e: Document, t: string, r: string, i: string) => {
      const w = m as unknown as Record<string, TYmFunction>;

      w[i] =
        w[i] ||
        ((...args: unknown[]) => {
          (w[i].a = w[i].a || []).push(args);
        });

      w[i].l = Date.now();

      for (const script of e.scripts) {
        if (script.src === r) {
          return;
        }
      }

      const k = e.createElement(t) as HTMLScriptElement;
      const a = e.getElementsByTagName(t)[0];

      k.async = true;
      k.src = r;
      a.parentNode?.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

    window.ym?.(counterId, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
    });
  };

  readonly sendPage = (url: string): void => {
    window.ym?.(this._counterId, 'hit', url);
  };

  readonly sendEvent = (event: string, params?: Record<string, unknown>): void => {
    window.ym?.(this._counterId, 'reachGoal', event, params);
  };
}
