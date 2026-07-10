import fs from 'node:fs';

import { CONFIG_PATH, EXAMPLE_CONFIG_PATH } from './constants';
import { addError, addWarning } from './messages';
import { printReport } from './report';
import {
  validateAnalytics,
  validateCategories,
  validateChannels,
  validateServices,
  validateSupport,
  validateUnusedCategories,
} from './validators';

const validate = (): void => {
  if (!fs.existsSync(CONFIG_PATH)) {
    const hint = fs.existsSync(EXAMPLE_CONFIG_PATH)
      ? `\n     Создайте его из шаблона: cp ${EXAMPLE_CONFIG_PATH} ${CONFIG_PATH}`
      : '';

    addWarning('config', `Файл конфигурации не найден: ${CONFIG_PATH}${hint}`);

    return;
  }

  let config: Record<string, unknown>;

  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');

    config = JSON.parse(raw) as Record<string, unknown>;
  } catch (e) {
    addError('config', `Ошибка парсинга JSON: ${(e as Error).message}`);

    return;
  }

  const requiredRootFields = ['channels', 'categories', 'services', 'support', 'analytics'];

  for (const field of requiredRootFields) {
    if (!(field in config)) {
      addError(field, `Отсутствует обязательное корневое поле "${field}"`);
    }
  }

  const categoryIds = validateCategories(config);
  const globalIds = new Map<string, string>();
  const usedCategoryIds = new Set<string>();

  validateChannels(config, categoryIds, globalIds, usedCategoryIds);
  validateServices(config, categoryIds, globalIds, usedCategoryIds);
  validateUnusedCategories(config, usedCategoryIds);
  validateSupport(config);
  validateAnalytics(config);
};

validate();
printReport();
