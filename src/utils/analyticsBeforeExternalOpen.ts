/** Задержка перед переходом во внешний клиент Max, чтобы счётчики успели принять reachGoal */
const BEFORE_EXTERNAL_OPEN_MS = 500;

export const runAfterAnalyticsDispatch = (fn: () => void): number =>
  window.setTimeout(fn, BEFORE_EXTERNAL_OPEN_MS);
