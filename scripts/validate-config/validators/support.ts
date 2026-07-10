import { addError, addWarning } from '../messages';
import { isNonEmptyString, isValidUrl } from '../utils';

export const validateSupport = (config: Record<string, unknown>): void => {
  const support = config.support as Record<string, unknown> | undefined;

  if (!support || typeof support !== 'object') {
    return;
  }

  const blocks = ['chatbot', 'operator', 'techSupport'] as const;
  let filledCount = 0;

  blocks.forEach((block) => {
    const data = support[block] as Record<string, unknown> | null | undefined;

    if (
      data !== null &&
      data !== undefined &&
      typeof data === 'object' &&
      Object.keys(data).length > 0
    ) {
      filledCount++;
      const prefix = `support.${block}`;

      if (!isNonEmptyString(data.name)) {
        addError(`${prefix}.name`, 'Поле "name" обязательно для заполненного блока поддержки');
      }

      if (!isNonEmptyString(data.description)) {
        addError(
          `${prefix}.description`,
          'Поле "description" обязательно для заполненного блока поддержки'
        );
      }

      if (!isValidUrl(data.link)) {
        addError(`${prefix}.link`, `Некорректный URL в поле "link": "${String(data.link)}"`);
      }
    }
  });

  if (filledCount === 0) {
    addWarning('support', 'Ни один элемент поддержки не заполнен — блок не будет отображаться');
  }
};
