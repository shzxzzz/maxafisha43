import * as React from 'react';

/**
 * Хук для создания задержки (debounce) значения
 * @param value - значение для задержки
 * @param delay - задержка в миллисекундах
 * @returns значение с задержкой
 */
export const useDebounce = <T>(value: T, delay = 300): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
