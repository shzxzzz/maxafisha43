import { addError, addWarning } from '../messages';
import { checkIcon, isNonEmptyString } from '../utils';

export const validateCategories = (config: Record<string, unknown>): Set<string> => {
  const categoryIds = new Set<string>();
  const categories = config.categories;

  if (!Array.isArray(categories)) {
    return categoryIds;
  }

  categories.forEach((cat: Record<string, unknown>, i: number) => {
    const prefix = `categories[${i}]`;

    if (isNonEmptyString(cat.id)) {
      if (categoryIds.has(cat.id)) {
        addError(`${prefix}.id`, `Дубликат id категории: "${cat.id}"`);
      }

      categoryIds.add(cat.id);
    } else {
      addError(`${prefix}.id`, 'Поле "id" категории должно быть непустой строкой');
    }

    if (!isNonEmptyString(cat.name)) {
      addError(`${prefix}.name`, 'Поле "name" категории должно быть непустой строкой');
    }
  });

  const mainCategories = categories.filter((c: Record<string, unknown>) => c.show_on_main === true);

  if (mainCategories.length < 2 || mainCategories.length > 5) {
    addError(
      'categories',
      'Категорий с show_on_main: true менее 2 или более 5',
      `Найдено: ${mainCategories.length}. Допустимо: от 2 до 5`
    );
  }

  mainCategories.forEach((cat: Record<string, unknown>) => {
    const idx = categories.indexOf(cat);
    const prefix = `categories[${idx}]`;

    if (isNonEmptyString(cat.icon)) {
      checkIcon(cat.icon, `${prefix}.icon`, 'categories');
    } else {
      addError(
        prefix,
        `Категория "${String(cat.name)}" с show_on_main: true не имеет иконки`,
        'Все категории с show_on_main: true обязаны иметь заполненное поле "icon"'
      );
    }
  });

  return categoryIds;
};

export const validateUnusedCategories = (
  config: Record<string, unknown>,
  usedCategoryIds: Set<string>
): void => {
  const categories = config.categories;

  if (!Array.isArray(categories)) {
    return;
  }

  categories.forEach((cat: Record<string, unknown>, i: number) => {
    if (isNonEmptyString(cat.id) && !usedCategoryIds.has(cat.id)) {
      addWarning(
        `categories[${i}]`,
        `Категория "${String(cat.name)}" не содержит привязанных сервисов — не будет отображаться`
      );
    }
  });
};
