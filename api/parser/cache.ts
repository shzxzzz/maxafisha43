import { readFile } from 'fs/promises';
import path from 'path';

import type { TEventItem } from '../../src/pages/ParserPage/data';

type TParserEventsCache = {
  generatedAt?: string;
  items?: TEventItem[];
};

const CACHE_PATH = path.resolve(process.cwd(), 'static', 'parser-events-cache.json');

export const readParserEventsCache = async (): Promise<TParserEventsCache> => {
  const raw = await readFile(CACHE_PATH, 'utf8');

  return JSON.parse(raw) as TParserEventsCache;
};

export const readCachedParserEvents = async (): Promise<TEventItem[]> => {
  const cache = await readParserEventsCache();

  return cache.items ?? [];
};
