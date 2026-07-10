export type TPluralizeWords = {
  one: string;
  two: string;
  five: string;
};

/**
 * Определяет падежное окончание слова в зависимости от числа сущностей.
 * @param {number} count Число сущностей
 * @param {TPluralizeWords} variants Варианты слова в разных падежах. Пример: { one: 'кот', two: 'кота', five: 'котов' }
 * @returns {string} Слово с нужным падежным окончанием
 */
export const plural = (count: number, variants: TPluralizeWords): string => {
  const lastTwo = count % 100;

  if (lastTwo > 10 && lastTwo < 20) {
    return variants.five;
  }

  const last = count % 10;

  if (last === 1) {
    return variants.one;
  }

  if (last > 1 && last < 5) {
    return variants.two;
  }

  return variants.five;
};
