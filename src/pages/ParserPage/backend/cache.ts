import cache from '../../../../static/parser-events-cache.json';

import type { TEventItem } from '../data';

type TParserEventsCache = {
  generatedAt?: string;
  items?: TEventItem[];
};

const parserEventsCache = cache as TParserEventsCache;

export const getCachedParserEvents = (): TEventItem[] => parserEventsCache.items ?? [];
