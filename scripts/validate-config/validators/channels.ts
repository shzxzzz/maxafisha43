import { VALID_TYPES } from '../constants';
import { addError, addWarning } from '../messages';
import { checkIcon, isNonEmptyString, isValidUrl } from '../utils';

export const validateChannels = (
  config: Record<string, unknown>,
  categoryIds: Set<string>,
  globalIds: Map<string, string>,
  usedCategoryIds: Set<string>
): void => {
  const channels = config.channels;

  if (!Array.isArray(channels)) {
    return;
  }

  if (channels.length === 0) {
    addWarning('channels', 'Массив каналов пуст — карусель не будет отображаться');

    return;
  }

  channels.forEach((ch: Record<string, unknown>, i: number) => {
    const prefix = `channels[${i}]`;

    if (isNonEmptyString(ch.id)) {
      const id = ch.id;

      if (globalIds.has(id)) {
        addError(
          `${prefix}.id`,
          `Дубликат id: "${id}"`,
          `Первое вхождение: ${globalIds.get(id) ?? ''}\nВторое вхождение: ${prefix}`
        );
      }

      globalIds.set(id, prefix);
    } else {
      addError(`${prefix}.id`, 'Поле "id" канала должно быть непустой строкой');
    }

    if (!isNonEmptyString(ch.name)) {
      addError(`${prefix}.name`, 'Поле "name" должно быть непустой строкой');
    }

    if (!isNonEmptyString(ch.description)) {
      addError(`${prefix}.description`, 'Поле "description" должно быть непустой строкой');
    }

    if (!VALID_TYPES.includes(ch.type as string)) {
      addError(
        `${prefix}.type`,
        `Недопустимое значение type: "${String(ch.type)}"`,
        `Допустимые значения: ${VALID_TYPES.join(', ')}`
      );
    }

    if (!isNonEmptyString(ch.owner)) {
      addError(`${prefix}.owner`, 'Поле "owner" должно быть непустой строкой');
    }

    if (!isValidUrl(ch.link)) {
      addError(`${prefix}.link`, `Некорректный URL в поле "link": "${String(ch.link)}"`);
    }

    if (ch.icon !== undefined && isNonEmptyString(ch.icon)) {
      checkIcon(ch.icon, `${prefix}.icon`, 'channels', false);
    }

    if (ch.tags !== undefined) {
      if (!Array.isArray(ch.tags) || !ch.tags.every((t: unknown) => typeof t === 'string')) {
        addError(`${prefix}.tags`, 'Поле "tags" должно быть массивом строк');
      }
    }

    if (ch.category_ids !== undefined) {
      if (
        !Array.isArray(ch.category_ids) ||
        !ch.category_ids.every((id: unknown) => typeof id === 'string')
      ) {
        addError(`${prefix}.category_ids`, 'Поле "category_ids" должно быть массивом строк');
      } else {
        ch.category_ids.forEach((catId: string) => {
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
      }
    }

    if (ch.popular !== undefined && typeof ch.popular !== 'boolean') {
      addError(`${prefix}.popular`, 'Поле "popular" должно быть boolean');
    }

    if (ch.federal !== undefined && typeof ch.federal !== 'boolean') {
      addError(`${prefix}.federal`, 'Поле "federal" должно быть boolean');
    }
  });
};
