type TWithCategoryIds = { category_ids?: string[] };

export const filterByCategory = <T extends TWithCategoryIds>(items: T[], categoryId: string): T[] =>
  items.filter((item) => item.category_ids?.includes(categoryId));
