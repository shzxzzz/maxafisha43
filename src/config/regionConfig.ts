import { TChannel, TRegionConfig, TService } from 'types/config';

/* eslint-disable import/no-unresolved */
// @ts-ignore-next-line
import regionJson from '../../static/region.json';

export const regionConfig = regionJson as TRegionConfig;

const CHANNEL_IDS = new Set(regionConfig.channels.map((c) => c.id));

/** Подпапка в `static/static/` для локальных иконок в конфиге */
export type TIconFolder = 'categories' | 'channels' | 'services';

/** Иконка элемента из списка «сервисы + каналы» (разные каталоги статики). */
export const resolveServiceItemIconUrl = (item: {
  id: string;
  icon?: string;
}): string | undefined =>
  resolveIconUrl(item.icon, CHANNEL_IDS.has(item.id) ? 'channels' : 'services');

/**
 * Локальная иконка в JSON — имя файла (`icon.png`) в соответствующей папке
 * или относительный путь (`categories/custom.png`) для особых случаев.
 */
export const resolveIconUrl = (
  icon: string | undefined,
  folder: TIconFolder
): string | undefined => {
  if (!icon) {
    return undefined;
  }

  if (icon.startsWith('http://') || icon.startsWith('https://')) {
    return icon;
  }

  if (icon.includes('/')) {
    return `/static/${icon}`;
  }

  return `/static/${folder}/${icon}`;
};

export const findServiceOrChannel = (id: string): TService | TChannel | undefined =>
  regionConfig.services.find((s) => s.id === id) ?? regionConfig.channels.find((c) => c.id === id);
