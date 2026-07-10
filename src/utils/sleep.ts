/**
 * Задержка выполнения кода на определенное количество миллисекунд.
 * @param {number} timeout Количество миллисекунд
 */
export const sleep = (timeout: number): Promise<void> => {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve();
      clearTimeout(timeoutId);
    }, timeout);
  });
};
