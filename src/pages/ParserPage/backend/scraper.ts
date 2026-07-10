import type { TEventItem } from '../data';

const SOURCE_PAGES = ['/kirov/concerts/', '/kirov/theatre/', '/kirov/musicals/', '/kirov/standup/', '/kirov/kids/', '/kirov/exhibitions/'];

const BASE_URL = 'https://www.afisha.ru';
const MAX_EVENTS = 24;
const MAX_ITEMS_PER_PAGE = 8;
const CACHE_TTL_MS = 10 * 60 * 1000;

const allowedEventPathPrefixes = ['/concert/', '/performance/', '/exhibition/'];

const monthMap: Record<string, number> = {
  января: 0,
  февраля: 1,
  марта: 2,
  апреля: 3,
  мая: 4,
  июня: 5,
  июля: 6,
  августа: 7,
  сентября: 8,
  октября: 9,
  ноября: 10,
  декабря: 11,
};

type TRawParsedItem = {
  title: string;
  category: string;
  link: string;
  imageUrl: string;
  meta: string;
};

type TCacheEntry<T> = {
  timestamp: number;
  value: T;
};

let eventsCache: TCacheEntry<TEventItem[]> | null = null;

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code: string) => String.fromCharCode(Number.parseInt(code, 16)));

const normalizeText = (value: string): string => decodeHtmlEntities(value).replace(/\s+/g, ' ').trim();

const normalizeComparableText = (value: string): string => normalizeText(value).toLowerCase();

const htmlToText = (value: string): string =>
  decodeHtmlEntities(value)
    .replace(/\u0000/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]*>/g, '')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();

const encodeEventId = (path: string): string => encodeURIComponent(path);

const isAllowedEventPath = (path: string): boolean => allowedEventPathPrefixes.some((prefix) => path.startsWith(prefix));

const chunk = <T>(items: T[], size: number): T[][] => {
  const result: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }

  return result;
};

const parseSchedule = (meta: string): Pick<TEventItem, 'date' | 'time' | 'location'> => {
  const normalized = normalizeText(meta);

  if (!normalized) {
    return {
      date: '',
      time: '',
      location: '',
    };
  }

  const scheduleMatch = normalized.match(/^(.+?)\s\u0432\s(\d{1,2}:\d{2})(?:,\s*(.+))?$/i);

  if (scheduleMatch) {
    return {
      date: scheduleMatch[1].trim(),
      time: scheduleMatch[2].trim(),
      location: normalizeText(scheduleMatch[3] ?? ''),
    };
  }

  const dateLocationMatch = normalized.match(/^(.+?)(?:,\s*(.+))?$/);

  return {
    date: dateLocationMatch?.[1]?.trim() ?? normalized,
    time: '',
    location: normalizeText(dateLocationMatch?.[2] ?? ''),
  };
};

const getMatch = (block: string, pattern: RegExp): string => {
  const match = block.match(pattern);

  return normalizeText(match?.[1] ?? '');
};

const parsePageItems = (html: string): TRawParsedItem[] => {
  const items: TRawParsedItem[] = [];
  const blockRegex =
    /<div[^>]+role="listitem"[^>]+aria-label="([^"]+)"[^>]+data-test="ITEM">([\s\S]*?)<div class="BxbtC" style="--avg:url\(([^)]+)\)"\s*><\/div>/g;

  for (const match of html.matchAll(blockRegex)) {
    const block = match[2];
    const link = getMatch(block, /<a class="CjnHd" data-test="LINK" href="([^"]+)"/);

    if (!link || !isAllowedEventPath(link)) {
      continue;
    }

    items.push({
      title: getMatch(block, /<div class="VeVyd"[^>]*>([\s\S]*?)<\/div>/),
      category: getMatch(block, /<div class="TmmXT">([\s\S]*?)<\/div>/),
      link,
      imageUrl: getMatch(block, /<img data-test="IMAGE"[^>]*src="([^"]+)"/),
      meta: getMatch(block, /<div class="gVGDC">([\s\S]*?)<\/div>/),
    });
  }

  return items.slice(0, MAX_ITEMS_PER_PAGE);
};

const extractMetaContent = (html: string, names: string[]): string => {
  for (const name of names) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${escapedName}["'][^>]+content=["']([^"']+)["']`, 'i');
    const match = html.match(regex);

    if (match?.[1]) {
      return normalizeText(match[1]);
    }
  }

  return '';
};

const extractArtistDescription = (html: string): string => {
  const scriptMatch = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);

  if (!scriptMatch?.[1]) {
    return '';
  }

  try {
    const data = JSON.parse(scriptMatch[1]) as {
      '@graph'?: Array<{
        description?: string;
        '@type'?: string;
      }>;
    };

    const eventItem = data['@graph']?.find((item) => typeof item.description === 'string' && item.description.length > 0);

    if (!eventItem) {
      return '';
    }

    return htmlToText(eventItem.description ?? '');
  } catch {
    return '';
  }
};

const parseDateLabelToTimestamp = (dateLabel: string, timeLabel: string): number => {
  const normalizedDate = normalizeText(dateLabel).toLowerCase();

  if (!normalizedDate) {
    return Number.POSITIVE_INFINITY;
  }

  const currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = currentDate.getMonth();
  let day = currentDate.getDate();

  const cleanDate = normalizedDate
    .replace(/^до\s+/i, '')
    .replace(/^с\s+/i, '')
    .replace(/^по\s+/i, '')
    .replace(/^[а-яё]+,\s*/i, '')
    .replace(/[()]/g, '')
    .trim();

  const numericMatch = cleanDate.match(/^(\d{1,2})(?:[./-](\d{1,2})(?:[./-](\d{2,4}))?)?$/);
  const monthNameFirstMatch = cleanDate.match(/^([а-яё]+)\s+(\d{1,2})(?:,\s*(\d{4}))?$/i);
  const dayFirstMatch = cleanDate.match(/^(\d{1,2})\s+([а-яё]+)(?:,\s*(\d{4}))?$/i);

  if (numericMatch) {
    day = Number(numericMatch[1]);

    if (numericMatch[2]) {
      month = Number(numericMatch[2]) - 1;
    }

    if (numericMatch[3]) {
      year = Number(numericMatch[3].length === 2 ? `20${numericMatch[3]}` : numericMatch[3]);
    }
  } else if (monthNameFirstMatch) {
    month = monthMap[monthNameFirstMatch[1]];
    day = Number(monthNameFirstMatch[2]);

    if (monthNameFirstMatch[3]) {
      year = Number(monthNameFirstMatch[3]);
    }
  } else if (dayFirstMatch) {
    day = Number(dayFirstMatch[1]);
    month = monthMap[dayFirstMatch[2]];

    if (dayFirstMatch[3]) {
      year = Number(dayFirstMatch[3]);
    }
  } else if (cleanDate === 'сегодня') {
    // keep current day
  } else if (cleanDate === 'завтра') {
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    year = tomorrow.getFullYear();
    month = tomorrow.getMonth();
    day = tomorrow.getDate();
  } else {
    return Number.POSITIVE_INFINITY;
  }

  if (Number.isNaN(month) || month < 0) {
    return Number.POSITIVE_INFINITY;
  }

  const candidate = new Date(year, month, day);

  if (
    candidate.getMonth() === month &&
    candidate.getFullYear() === year &&
    candidate.getDate() === day &&
    candidate.getTime() < currentDate.getTime() &&
    !numericMatch?.[3] &&
    !monthNameFirstMatch?.[3] &&
    !dayFirstMatch?.[3]
  ) {
    candidate.setFullYear(candidate.getFullYear() + 1);
  }

  const timeMatch = normalizeText(timeLabel).match(/^(\d{1,2})[:.](\d{2})$/);

  if (timeMatch) {
    candidate.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);
  } else {
    candidate.setHours(0, 0, 0, 0);
  }

  return candidate.getTime();
};

const extractSortTimestamp = (html: string): number => {
  const patterns = [
    /"startDate"\s*:\s*"([^"]+)"/i,
    /"start_date"\s*:\s*"([^"]+)"/i,
    /"dateStart"\s*:\s*"([^"]+)"/i,
    /"start_time"\s*:\s*"([^"]+)"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (!match?.[1]) {
      continue;
    }

    const timestamp = Date.parse(match[1]);

    if (Number.isFinite(timestamp)) {
      return timestamp;
    }
  }

  return Number.POSITIVE_INFINITY;
};

const extractEventDescription = (html: string): string => {
  const contentMatch = html.match(
    /<div[^>]+data-test="OBJECT-DESCRIPTION-CONTENT"[^>]*>[\s\S]*?<div[^>]+data-test="RESTRICT-TEXT"[^>]*>[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i
  );

  return htmlToText(contentMatch?.[1] ?? '');
};

const extractTitle = (html: string): string => {
  const coverMatch = html.match(/<div class="oOY35 XPF_z"[^>]*data-test="ITEM-NAME">([\s\S]*?)<\/div>/);

  if (coverMatch?.[1]) {
    return normalizeText(coverMatch[1]);
  }

  const titleMatch = html.match(/<title>([^<]+)<\/title>/);

  return normalizeText(titleMatch?.[1] ?? '');
};

const extractCategory = (html: string): string => {
  const coverMatch = html.match(/<h1 class="lWj_Z">[\s\S]*?<span class="TSyWq RNOFc uFbju" data-test="ITEM-META">([\s\S]*?)<\/span>/);

  return normalizeText(coverMatch?.[1] ?? '');
};

const fetchHtml = async (url: string): Promise<string> => {
  const response = await fetch(url, {
    headers: {
      'accept-language': 'ru-RU,ru;q=0.9,en;q=0.8',
      'cache-control': 'no-cache',
      pragma: 'no-cache',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load ${url} (${response.status})`);
  }

  return response.text();
};

const fetchEventDetail = async (item: TRawParsedItem): Promise<TEventItem> => {
  const absoluteUrl = new URL(item.link, BASE_URL).toString();
  const html = await fetchHtml(absoluteUrl);
  const description = extractEventDescription(html) || extractMetaContent(html, ['description', 'og:description', 'twitter:description']);
  const artistDescription = extractArtistDescription(html);
  const imageUrl = extractMetaContent(html, ['og:image', 'twitter:image']) || item.imageUrl;
  const title = item.title || extractTitle(html);
  const category = item.category || extractCategory(html);
  const { date, time, location } = parseSchedule(item.meta);
  const parsedSortTimestamp = parseDateLabelToTimestamp(date, time);
  const sortTimestamp = Number.isFinite(parsedSortTimestamp) ? parsedSortTimestamp : extractSortTimestamp(html);
  const normalizedDescription = normalizeComparableText(description);
  const normalizedArtistDescription = normalizeComparableText(artistDescription);

  return {
    id: encodeEventId(item.link),
    title,
    category,
    sortTimestamp,
    date,
    time,
    location,
    description: description || item.meta,
    artistDescription: normalizedDescription && normalizedDescription === normalizedArtistDescription ? '' : artistDescription,
    imageUrl,
    link: absoluteUrl,
  };
};

const fetchPageItems = async (pagePath: string): Promise<TRawParsedItem[]> => {
  const html = await fetchHtml(new URL(pagePath, BASE_URL).toString());
  return parsePageItems(html);
};

const loadEvents = async (): Promise<TEventItem[]> => {
  const sourcePages = (
    await Promise.allSettled(SOURCE_PAGES.map(async (pagePath) => fetchPageItems(pagePath)))
  ).flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
  const uniqueItems = new Map<string, TRawParsedItem>();

  for (const pageItems of sourcePages) {
    for (const item of pageItems) {
      if (!uniqueItems.has(item.link)) {
        uniqueItems.set(item.link, item);
      }
    }
  }

  const rawItems = [...uniqueItems.values()].slice(0, MAX_EVENTS);
  const enrichedItems: TEventItem[] = [];

  for (const group of chunk(rawItems, 4)) {
    const resolved = await Promise.all(
      group.map(async (item) => {
        try {
          return await fetchEventDetail(item);
        } catch {
          const { date, time, location } = parseSchedule(item.meta);

          return {
            id: encodeEventId(item.link),
            title: item.title,
            category: item.category,
            sortTimestamp: parseDateLabelToTimestamp(date, time),
            date,
            time,
            location,
            description: item.meta,
            artistDescription: '',
            imageUrl: item.imageUrl,
            link: new URL(item.link, BASE_URL).toString(),
          } satisfies TEventItem;
        }
      })
    );

    enrichedItems.push(...resolved);
  }

  return enrichedItems.sort((left, right) => {
    if (left.sortTimestamp !== right.sortTimestamp) {
      return left.sortTimestamp - right.sortTimestamp;
    }

    return left.title.localeCompare(right.title, 'ru');
  });
};

export const getParserEvents = async (): Promise<TEventItem[]> => {
  if (eventsCache && Date.now() - eventsCache.timestamp < CACHE_TTL_MS) {
    return eventsCache.value;
  }

  const value = await loadEvents();
  eventsCache = {
    timestamp: Date.now(),
    value,
  };

  return value;
};

export const getParserEvent = async (eventId?: string): Promise<TEventItem | undefined> => {
  if (!eventId) {
    return undefined;
  }

  const normalizedEventId = encodeEventId(decodeURIComponent(eventId));
  const events = await getParserEvents();

  return events.find((item) => item.id === normalizedEventId);
};
