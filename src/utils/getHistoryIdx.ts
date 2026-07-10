export const getHistoryIdx = (): number => {
  const state: unknown = window.history.state;

  if (typeof state === 'object' && state !== null && 'idx' in state) {
    const { idx } = state as { idx: unknown };

    return typeof idx === 'number' ? idx : 0;
  }

  return 0;
};
