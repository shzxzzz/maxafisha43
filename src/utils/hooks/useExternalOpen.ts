import * as React from 'react';

import { runAfterAnalyticsDispatch } from 'utils/analyticsBeforeExternalOpen';

/**
 * Обёртка над `runAfterAnalyticsDispatch` с флагом `isLoading`,
 * позволяющим показывать индикатор загрузки на время ожидания отправки счётчиков.
 */
export const useExternalOpen = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const timerRef = React.useRef<number>();

  const open = React.useCallback((fn: () => void) => {
    setIsLoading(true);
    timerRef.current = runAfterAnalyticsDispatch(() => {
      fn();
      setIsLoading(false);
    });
  }, []);

  React.useEffect(
    () => () => {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
      }
    },
    []
  );

  return { open, isLoading };
};
