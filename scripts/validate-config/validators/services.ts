import { VALID_TYPES } from '../constants';
import { addError } from '../messages';
import { checkIcon, isNonEmptyString, isValidUrl } from '../utils';

export const validateServices = (
  config: Record<string, unknown>,
  categoryIds: Set<string>,
  globalIds: Map<string, string>,
  usedCategoryIds: Set<string>
): void => {
  const services = config.services;

  if (!Array.isArray(services)) {
    return;
  }

  services.forEach((svc: Record<string, unknown>, i: number) => {
    const prefix = `services[${i}]`;

    if (isNonEmptyString(svc.id)) {
      const id = svc.id;

      if (globalIds.has(id)) {
        addError(
          `${prefix}.id`,
          `Дубликат id: "${id}"`,
          `Первое вхождение: ${globalIds.get(id) ?? ''}\nВторое вхождение: ${prefix}`
        );
      }

      globalIds.set(id, prefix);
    } else {
      addError(`${prefix}.id`, 'Поле "id" сервиса должно быть непустой строкой');
    }

    if (!isNonEmptyString(svc.name)) {
      addError(`${prefix}.name`, 'Поле "name" должно быть непустой строкой');
    }

    if (!isNonEmptyString(svc.description)) {
      addError(`${prefix}.description`, 'Поле "description" должно быть непустой строкой');
    }

    if (!VALID_TYPES.includes(svc.type as string)) {
      addError(
        `${prefix}.type`,
        `Недопустимое значение type: "${String(svc.type)}"`,
        `Допустимые значения: ${VALID_TYPES.join(', ')}`
      );
    }

    if (!isNonEmptyString(svc.owner)) {
      addError(`${prefix}.owner`, 'Поле "owner" должно быть непустой строкой');
    }

    if (!isValidUrl(svc.link)) {
      addError(`${prefix}.link`, `Некорректный URL в поле "link": "${String(svc.link)}"`);
    }

    if (!Array.isArray(svc.category_ids) || svc.category_ids.length === 0) {
      addError(
        `${prefix}.category_ids`,
        'Поле "category_ids" обязательно и должно содержать минимум 1 категорию'
      );
    } else if (svc.category_ids.every((id: unknown) => typeof id === 'string')) {
      svc.category_ids.forEach((catId: string) => {
        if (categoryIds.has(catId)) {
          usedCategoryIds.add(catId);
        } else {
          addError(
            `${prefix}.category_ids`,
            `Ссылка на несуществующую категорию: "${catId}"`,
            `Допустимые id категорий: ${[...categoryIds].join(', ')}`
          );
        }
      });
    } else {
      addError(`${prefix}.category_ids`, 'Все элементы category_ids должны быть строками');
    }

    if (svc.icon !== undefined && isNonEmptyString(svc.icon)) {
      checkIcon(svc.icon, `${prefix}.icon`, 'services', false);
    }

    if (svc.tags !== undefined) {
      if (!Array.isArray(svc.tags) || !svc.tags.every((t: unknown) => typeof t === 'string')) {
        addError(`${prefix}.tags`, 'Поле "tags" должно быть массивом строк');
      }
    }

    if (svc.popular !== undefined && typeof svc.popular !== 'boolean') {
      addError(`${prefix}.popular`, 'Поле "popular" должно быть boolean');
    }

    if (svc.federal !== undefined && typeof svc.federal !== 'boolean') {
      addError(`${prefix}.federal`, 'Поле "federal" должно быть boolean');
    }
  });
};
