export const getScrollParent = (node: HTMLElement | null): HTMLElement | null => {
  let current = node?.parentElement ?? null;

  while (current) {
    const { overflow, overflowY } = getComputedStyle(current);

    if (/auto|scroll/.test(`${overflow} ${overflowY}`)) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
};
