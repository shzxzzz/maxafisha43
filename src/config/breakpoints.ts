/** Список брейкпоинтов в порядке от наименьшего к наибольшему */
export const BREAKPOINTS = ['mobile', 'tablet', 'desktop'] as const;

export type TBreakpoint = (typeof BREAKPOINTS)[number];

/** Максимальные значения ширины (max-width) для брейкпоинтов
 * используются для оптимизации загрузки изображений. */
export const BREAKPOINTS_MAX_WIDTH: Partial<Record<TBreakpoint, number>> = {
  mobile: 767,
  tablet: 1023,
};
