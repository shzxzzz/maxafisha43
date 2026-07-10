import fs from 'node:fs';
import path from 'node:path';

import { STATIC_DIR, VALID_IMAGE_EXTENSIONS } from './constants';
import { addError, addWarning } from './messages';

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const isValidUrl = (value: unknown): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    const url = new URL(value);

    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

export const isExternalUrl = (value: string): boolean => value.startsWith('https://');

export type TIconFolder = 'categories' | 'channels' | 'services';

const toLocalRelativePath = (icon: string, folder: TIconFolder): string =>
  icon.includes('/') ? icon : path.join(folder, icon);

const checkLocalImage = (iconPath: string, jsonPath: string, required: boolean): void => {
  if (!iconPath || isExternalUrl(iconPath)) {
    return;
  }

  const fullPath = path.join(STATIC_DIR, iconPath);

  if (!fs.existsSync(fullPath)) {
    if (required) {
      addError(jsonPath, `Файл не найден: "${iconPath}"`, `Ожидается файл: ${fullPath}`);
    } else {
      addWarning(jsonPath, `Файл не найден: "${iconPath}"`, `Ожидается файл: ${fullPath}`);
    }

    return;
  }

  const ext = path.extname(iconPath).toLowerCase();

  if (ext && !VALID_IMAGE_EXTENSIONS.includes(ext)) {
    addError(
      jsonPath,
      `Неподдерживаемый формат изображения: "${ext}"`,
      `Поддерживаемые форматы: ${VALID_IMAGE_EXTENSIONS.join(', ')}`
    );
  }
};

const isRemoteIcon = (icon: string): boolean =>
  icon.startsWith('https://') || icon.startsWith('http://');

export const checkIcon = (
  icon: string,
  jsonPath: string,
  folder: TIconFolder,
  required = true
): void => {
  if (isRemoteIcon(icon)) {
    if (!isValidUrl(icon)) {
      addError(jsonPath, `Некорректный URL: "${icon}"`);
    }
  } else {
    checkLocalImage(toLocalRelativePath(icon, folder), jsonPath, required);
  }
};
