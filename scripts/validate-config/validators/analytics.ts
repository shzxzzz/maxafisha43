import { addError } from '../messages';
import { isNonEmptyString } from '../utils';

export const validateAnalytics = (config: Record<string, unknown>): void => {
  const analytics = config.analytics as Record<string, Record<string, unknown>> | undefined;

  if (!analytics || typeof analytics !== 'object') {
    return;
  }

  if (analytics.mytracker?.enabled === true) {
    if (!isNonEmptyString(analytics.mytracker.trackerId)) {
      addError(
        'analytics.mytracker.trackerId',
        'При mytracker.enabled === true поле "trackerId" должно быть непустой строкой'
      );
    }
  }

  if (analytics.yandexMetrika?.enabled === true) {
    if (!isNonEmptyString(analytics.yandexMetrika.counterId)) {
      addError(
        'analytics.yandexMetrika.counterId',
        'При yandexMetrika.enabled === true поле "counterId" должно быть непустой строкой'
      );
    }
  }
};
