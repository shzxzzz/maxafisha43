import type { TEventItem } from '../data';

const AFISHA_BASE_URL = 'https://www.afisha.ru';
const CULTURA_BASE_URL = 'https://cultura.kirovreg.ru';
const CULTURA_PROXY_BASE_URL = 'https://r.jina.ai/http://cultura.kirovreg.ru';
const TURKIROV_BASE_URL = 'https://xn--b1alfrhcki.xn--p1ai';
const TURKIROV_PROXY_BASE_URL = 'https://r.jina.ai/http://xn--b1alfrhcki.xn--p1ai';

const AFISHA_SOURCE_PAGES = [
  '/kirov/cinema/',
  '/kirov/festivals/',
  '/kirov/concerts/',
  '/kirov/theatre/',
  '/kirov/musicals/',
  '/kirov/standup/',
  '/kirov/kids/',
  '/kirov/exhibitions/',
];
const TURKIROV_SOURCE_PAGES = ['/afisha/', '/afisha/?PAGEN_1=2', '/afisha/?PAGEN_1=3', '/afisha/?PAGEN_1=4'];

const MAX_ITEMS_PER_PAGE = 50;
const CACHE_TTL_MS = 10 * 60 * 1000;

const allowedEventPathPrefixes = ['/concert/', '/performance/', '/exhibition/', '/movie/', '/film/', '/festival/'];

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

const russianMonthNames = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

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

type TTurkirovListItem = {
  title: string;
  category: string;
  detailUrl: string;
  imageUrl: string;
  dateLabel: string;
  timeLabel: string;
};

type TCulturaListItem = {
  title: string;
  detailUrl: string;
};

type TCinemaListItem = {
  title: string;
  description: string;
  imageUrl: string;
  movieUrl: string;
  scheduleUrl: string;
};

type TCinemaScheduleInfo = {
  minScheduleDate: string;
  maxScheduleDate: string;
  places: string;
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

const stripMarkdown = (value: string): string =>
  normalizeText(
    value
      .replace(/\*\*/g, '')
      .replace(/[_`]/g, '')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/<br\s*\/?>/gi, ' ')
  );

const normalizeCultureCategory = (value: string): string => {
  const normalized = value.toLowerCase();

  if (normalized.includes('кино') || normalized.includes('фильм') || normalized.includes('полнокуполь')) {
    return 'кино';
  }

  if (normalized.includes('музе')) {
    return 'музей';
  }

  if (normalized.includes('фестив')) {
    return 'фестиваль';
  }

  if (normalized.includes('спектак') || normalized.includes('театр') || normalized.includes('постанов') || normalized.includes('пьес')) {
    return 'театр';
  }

  if (normalized.includes('экскурс')) {
    return 'экскурсия';
  }

  if (normalized.includes('лекц')) {
    return 'лекция';
  }

  if (normalized.includes('мастер') || normalized.includes('творческ')) {
    return 'мастер-класс';
  }

  return 'афиша';
};

const isGenericCulturePage = (title: string): boolean => {
  const normalized = title.toLowerCase();

  return (
    normalized === 'выставки г. киров' ||
    normalized === 'постоянные экспозиции' ||
    normalized === 'крупные мероприятия 2026 года'
  );
};

const classifyCultureEvent = (title: string, description: string, fallbackCategory: string): string => {
  const normalized = `${title} ${description}`.toLowerCase();

  if (normalized.includes('кино') || normalized.includes('фильм') || normalized.includes('полнокуполь')) {
    return 'кино';
  }

  if (normalized.includes('музе')) {
    return 'музей';
  }

  if (normalized.includes('фестив')) {
    return 'фестиваль';
  }

  if (normalized.includes('спектак') || normalized.includes('театр') || normalized.includes('постанов') || normalized.includes('пьес')) {
    return 'театр';
  }

  if (normalized.includes('экскурс')) {
    return 'экскурсия';
  }

  if (normalized.includes('лекц')) {
    return 'лекция';
  }

  if (normalized.includes('мастер') || normalized.includes('творческ')) {
    return 'мастер-класс';
  }

  return fallbackCategory;
};

const isCultureSourceLink = (link: string): boolean =>
  link.includes('cultura.kirovreg.ru') || link.includes('xn--b1alfrhcki.xn--p1ai');

const parseDateFilterKey = (value: string): string => {
  const normalized = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }

  return '';
};

const parseIsoDate = (value: string): Date | null => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const formatRussianDate = (value: Date): string => `${value.getDate()} ${russianMonthNames[value.getMonth()]} ${value.getFullYear()}`;

const formatRussianDateRange = (start: Date, end: Date): string => {
  if (start.getTime() === end.getTime()) {
    return formatRussianDate(start);
  }

  return `с ${formatRussianDate(start)} до ${formatRussianDate(end)}`;
};

const toLocalDateKey = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const parseLocalDateKey = (value: string): Date | null => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const parsed = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));

  if (
    parsed.getFullYear() !== Number(match[1]) ||
    parsed.getMonth() !== Number(match[2]) - 1 ||
    parsed.getDate() !== Number(match[3])
  ) {
    return null;
  }

  return parsed;
};

const getVisibleDateWindow = (): { start: Date; end: Date } => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const isEventInVisibleWindow = (event: TEventItem): boolean => {
  const { start: windowStart, end: windowEnd } = getVisibleDateWindow();
  const bounds = parseDateLabelBounds(event.date, event.time);
  const eventStart = bounds.start ?? bounds.end;
  const eventEnd = bounds.end ?? bounds.start;

  if (!eventStart || !eventEnd) {
    return false;
  }

  return eventEnd >= windowStart && eventStart <= windowEnd;
};

const buildDateFromLabel = (dateLabel: string, timeLabel: string): Date | null => {
  const normalized = normalizeText(dateLabel)
    .toLowerCase()
    .replace(/^с\s+/i, '')
    .replace(/^до\s+/i, '')
    .replace(/^по\s+/i, '')
    .replace(/^[а-яё]+,\s*/i, '')
    .replace(/\s+г\.?$/i, '')
    .replace(/[()]/g, '')
    .trim();

  if (!normalized) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  let year = currentYear;
  let month = -1;
  let day = -1;

  const numericMatch = normalized.match(/^(\d{1,2})(?:[./-](\d{1,2})(?:[./-](\d{2,4}))?)?$/);
  const dayFirstMatch = normalized.match(/^(\d{1,2})\s+([а-яё]+)(?:\s+(\d{4}))?$/i);
  const monthFirstMatch = normalized.match(/^([а-яё]+)\s+(\d{1,2})(?:\s+(\d{4}))?$/i);

  if (numericMatch) {
    day = Number(numericMatch[1]);

    if (numericMatch[2]) {
      month = Number(numericMatch[2]) - 1;
    }

    if (numericMatch[3]) {
      year = Number(numericMatch[3].length === 2 ? `20${numericMatch[3]}` : numericMatch[3]);
    }
  } else if (dayFirstMatch) {
    day = Number(dayFirstMatch[1]);
    month = monthMap[dayFirstMatch[2]];

    if (dayFirstMatch[3]) {
      year = Number(dayFirstMatch[3]);
    }
  } else if (monthFirstMatch) {
    month = monthMap[monthFirstMatch[1]];
    day = Number(monthFirstMatch[2]);

    if (monthFirstMatch[3]) {
      year = Number(monthFirstMatch[3]);
    }
  } else {
    return null;
  }

  if (Number.isNaN(month) || month < 0 || day < 1) {
    return null;
  }

  const candidate = new Date(year, month, day);

  if (candidate.getFullYear() !== year || candidate.getMonth() !== month || candidate.getDate() !== day) {
    return null;
  }

  const timeMatch = normalizeText(timeLabel).match(/^(\d{1,2})[:.](\d{2})$/);

  if (timeMatch) {
    candidate.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);
  } else {
    candidate.setHours(0, 0, 0, 0);
  }

  return candidate;
};

const parseDateLabelBounds = (dateLabel: string, timeLabel: string): { start: Date | null; end: Date | null } => {
  const normalized = normalizeText(dateLabel).toLowerCase();

  if (!normalized) {
    return { start: null, end: null };
  }

  const rangeMatch = normalized.match(/^с\s+(.+?)\s+до\s+(.+)$/i) ?? normalized.match(/^(.+?)\s+до\s+(.+)$/i);

  if (rangeMatch) {
    return {
      start: parseTimestampToLocalDate(rangeMatch[1], timeLabel),
      end: parseTimestampToLocalDate(rangeMatch[2], ''),
    };
  }

  if (normalized.startsWith('с ')) {
    return {
      start: parseTimestampToLocalDate(normalized.slice(2), timeLabel),
      end: null,
    };
  }

  if (normalized.startsWith('до ')) {
    return {
      start: null,
      end: parseTimestampToLocalDate(normalized.slice(3), ''),
    };
  }

  const date = parseTimestampToLocalDate(normalized, timeLabel);

  if (!date) {
    return { start: null, end: null };
  }

  return {
    start: date,
    end: date,
  };
};

const parseTimestampToLocalDate = (dateLabel: string, timeLabel: string): Date | null => buildDateFromLabel(dateLabel, timeLabel);

const isEventOnDate = (event: TEventItem, selectedDateKey: string): boolean => {
  const selectedDate = parseLocalDateKey(selectedDateKey);

  if (!selectedDate) {
    return true;
  }

  const bounds = parseDateLabelBounds(event.date, event.time);

  if (!bounds.start && !bounds.end) {
    return false;
  }

  const startKey = bounds.start ? toLocalDateKey(bounds.start) : '';
  const endKey = bounds.end ? toLocalDateKey(bounds.end) : '';
  const selectedKey = toLocalDateKey(selectedDate);

  if (startKey && endKey) {
    return selectedKey >= startKey && selectedKey <= endKey;
  }

  if (endKey) {
    return selectedKey <= endKey;
  }

  if (startKey) {
    return selectedKey === startKey;
  }

  return false;
};

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

  const scheduleMatch = normalized.match(/^(.+?)\sв\s(\d{1,2}:\d{2})(?:,\s*(.+))?$/i);

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

const parseCinemaListItems = (html: string): TCinemaListItem[] => {
  const scriptMatch = html.match(/<script data-test="JSONLD-MICRODATA" type="application\/ld\+json">([\s\S]*?)<\/script>/i);

  if (!scriptMatch?.[1]) {
    return [];
  }

  try {
    const data = JSON.parse(scriptMatch[1]) as {
      '@graph'?: Array<{
        itemListElement?: Array<{
          item?: {
            name?: string;
            description?: string;
            image?: string;
            url?: string;
            offers?: {
              url?: string;
            };
          };
        }>;
      }>;
    };
    const graph = data['@graph'] ?? [];

    return graph
      .flatMap((entry) => entry.itemListElement ?? [])
      .map((entry) => entry.item)
      .filter(
        (
          item
        ): item is {
          name: string;
          description?: string;
          image?: string;
          url: string;
          offers?: {
            url?: string;
          };
        } => Boolean(item?.name && item.url)
      )
      .map((item) => ({
        title: normalizeText(item.name),
        description: normalizeText(item.description ?? ''),
        imageUrl: normalizeText(item.image ?? ''),
        movieUrl: normalizeText(item.url),
        scheduleUrl: normalizeText(item.offers?.url ?? item.url),
      }))
      .filter((item) => Boolean(item.scheduleUrl));
  } catch {
    return [];
  }
};

const extractCinemaScheduleInfo = (html: string): TCinemaScheduleInfo | null => {
  const scheduleMatch = html.match(
    /"ScheduleInfo":\{"MinScheduleDate":"([^"]+)","MaxScheduleDate":"([^"]+)","TimeZoneOffset":"[^"]+"[\s\S]*?"SessionsCount":\d+/i
  );

  if (!scheduleMatch?.[1] || !scheduleMatch[2]) {
    return null;
  }

  const placesMatch = html.match(/"Notice":\{[\s\S]*?"Places":"([^"]*)"/i);

  return {
    minScheduleDate: scheduleMatch[1],
    maxScheduleDate: scheduleMatch[2],
    places: normalizeText(placesMatch?.[1] ?? ''),
  };
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
  const monthYearMatch = cleanDate.match(/^([а-яё]+)\s+(\d{4})$/i);
  const dayRangeMatch = cleanDate.match(/^(\d{1,2}),\s*(\d{1,2})\s+([а-яё]+)(?:,\s*(\d{4}))?$/i);
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
  } else if (monthYearMatch) {
    month = monthMap[monthYearMatch[1]];
    day = 1;
    year = Number(monthYearMatch[2]);
  } else if (dayRangeMatch) {
    day = Number(dayRangeMatch[1]);
    month = monthMap[dayRangeMatch[3]];

    if (dayRangeMatch[4]) {
      year = Number(dayRangeMatch[4]);
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
  } else if (cleanDate.includes('до')) {
    const rangeStart = cleanDate.split('до')[0]?.trim();

    if (!rangeStart) {
      return Number.POSITIVE_INFINITY;
    }

    return parseDateLabelToTimestamp(rangeStart, timeLabel);
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
    !dayRangeMatch?.[4] &&
    !dayFirstMatch?.[3] &&
    !monthYearMatch
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

const fetchHtml = async (url: string, init?: RequestInit): Promise<string> => {
  const response = await fetch(url, {
    headers: {
      'accept-language': 'ru-RU,ru;q=0.9,en;q=0.8',
      'cache-control': 'no-cache',
      pragma: 'no-cache',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Failed to load ${url} (${response.status})`);
  }

  return response.text();
};

const fetchTurkirovMarkdown = async (path: string): Promise<string> => {
  const url = `${TURKIROV_PROXY_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load ${url} (${response.status})`);
  }

  return response.text();
};

const parseTurkirovList = (markdown: string): TTurkirovListItem[] => {
  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const categoryPattern = /^(Выставки|Деловые|Кино|Конкурсы|Музыка|Образовательное|Спорт|Театр|Фестивали|Экскурсии)$/i;
  const events: TTurkirovListItem[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const titleMatch = lines[index].match(/^###\s+\[([^\]]+)\]\(([^)]+)\)$/);

    if (!titleMatch) {
      continue;
    }

    const title = stripMarkdown(titleMatch[1]);
    const detailUrl = titleMatch[2];

    let imageUrl = '';
    let dateLabel = '';
    let timeLabel = '';
    let category = '';

    for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
      const line = lines[cursor];

      if (!category && categoryPattern.test(line)) {
        category = line.toLowerCase();
        continue;
      }

      const imageMatch = line.match(/^!\[Image\s+\d+:[^\]]*\]\(([^)]+)\)$/);
      if (!imageUrl && imageMatch) {
        imageUrl = imageMatch[1];
        continue;
      }

      if (!dateLabel) {
        const parsed = line.match(/^(.+?)\s+в\s+(\d{1,2}:\d{2})$/i);

        if (parsed) {
          dateLabel = stripMarkdown(parsed[1]);
          timeLabel = parsed[2];
          continue;
        }

        const rangeParsed = line.match(/^С\s+(.+?)\s+до\s+(.+)$/i);
        if (rangeParsed) {
          dateLabel = `с ${stripMarkdown(rangeParsed[1])} до ${stripMarkdown(rangeParsed[2])}`;
          continue;
        }

        if (/^(?:\d{1,2}\s+[а-яё]+\s+\d{4}|\d{1,2}\s+[а-яё]+|\d{1,2},\s*\d{1,2}\s+[а-яё]+\s*(?:\d{4})?)$/i.test(line)) {
          dateLabel = stripMarkdown(line);
        }
      }

      if (category && imageUrl && dateLabel) {
        break;
      }
    }

    events.push({
      title,
      category: category || 'афиша',
      detailUrl,
      imageUrl,
      dateLabel,
      timeLabel,
    });
  }

  return events;
};

const parseTurkirovDetail = (markdown: string): { description: string; location: string; title: string; dateLabel: string; timeLabel: string; imageUrl: string } => {
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = stripMarkdown(titleMatch?.[1] ?? '');

  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let dateLabel = '';
  let timeLabel = '';
  let imageUrl = '';
  const bodyLines: string[] = [];
  const locationLines: string[] = [];
  let captureBody = false;

  for (const line of lines) {
    if (!dateLabel) {
      const dateTimeMatch = line.match(/^(.+?)\s+в\s+(\d{1,2}:\d{2})$/i);

      if (dateTimeMatch) {
        dateLabel = stripMarkdown(dateTimeMatch[1]);
        timeLabel = dateTimeMatch[2];
        continue;
      }

      if (/^(?:\d{1,2}\s+[а-яё]+\s+\d{4}|\d{1,2}\s+[а-яё]+|\d{1,2},\s*\d{1,2}\s+[а-яё]+\s*(?:\d{4})?|с\s+.+\s+до\s+.+)$/i.test(line)) {
        dateLabel = stripMarkdown(line);
        continue;
      }
    }

    if (!imageUrl) {
      const imageMatch = line.match(/^!\[Image\s+\d+:[^\]]*\]\(([^)]+)\)$/);

      if (imageMatch) {
        imageUrl = imageMatch[1];
        captureBody = true;
        continue;
      }
    }

    if (!captureBody) {
      continue;
    }

    if (line.startsWith('[') || line.startsWith('*') || /^Соц сети:/i.test(line) || /^Контакты$/i.test(line) || /^©/.test(line)) {
      continue;
    }

    if (!bodyLines.length && /^(?:\d{1,2}\s+[а-яё]+\s+\d{4}|\d{1,2},\s*\d{1,2}\s+[а-яё]+\s*(?:\d{4})?|с\s+.+\s+до\s+.+)$/i.test(line)) {
      continue;
    }

    if (bodyLines.length < 3) {
      bodyLines.push(stripMarkdown(line));
      continue;
    }

    if (locationLines.length < 3) {
      locationLines.push(stripMarkdown(line));
    }
  }

  const description = bodyLines.join(' ').trim();
  const location = locationLines.join(' ').trim();

  return {
    description,
    location,
    title,
    dateLabel,
    timeLabel,
    imageUrl,
  };
};

const fetchCulturaMarkdown = async (path: string): Promise<string> => {
  const url = `${CULTURA_PROXY_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load ${url} (${response.status})`);
  }

  return response.text();
};

const toCulturaPath = (value: string): string => {
  const url = new URL(value, CULTURA_BASE_URL);

  return `${url.pathname}${url.search}`;
};

const parseCulturaList = (markdown: string): TCulturaListItem[] => {
  const items = [...markdown.matchAll(/^###\s+\[([^\]]+)\]\(([^)]+\/afisha\/detail\/\d+\/?)\)$/gm)].map((match) => ({
    title: stripMarkdown(match[1]),
    detailUrl: match[2],
  }));

  const uniqueItems = new Map<string, TCulturaListItem>();

  for (const item of items) {
    if (!uniqueItems.has(item.detailUrl)) {
      uniqueItems.set(item.detailUrl, item);
    }
  }

  return [...uniqueItems.values()];
};

const parseCulturaDetail = (markdown: string): {
  title: string;
  dateLabel: string;
  description: string;
  location: string;
  imageUrl: string;
  extraCategory: string;
} => {
  const titleMatch = markdown.match(/^(?:#{1,2})\s+(.+)$/m);
  const title = stripMarkdown(titleMatch?.[1] ?? '');
  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let dateLabel = '';
  let imageUrl = '';
  const descriptionLines: string[] = [];
  const locationLines: string[] = [];
  let startedContent = false;

  for (const line of lines) {
    if (!dateLabel && /^(?:\d{1,2}\s+[а-яё]+\s+\d{4}|\d{1,2}\s+до\s+\d{1,2}\s+[а-яё]+\s+\d{4}|с\s+\d{1,2}\s+[а-яё]+\s+до\s+\d{1,2}\s+[а-яё]+\s+\d{4})$/i.test(line)) {
      dateLabel = stripMarkdown(line);
      continue;
    }

    if (!imageUrl) {
      const imageMatch = line.match(/^!\[Image\s+\d+:[^\]]*\]\(([^)]+)\)$/);

      if (imageMatch) {
        imageUrl = imageMatch[1];
        startedContent = true;
        continue;
      }
    }

    if (!startedContent) {
      continue;
    }

    if (/^Подробности:/i.test(line) || /^Соц сети:/i.test(line) || /^Контакты/i.test(line) || /^©/.test(line)) {
      continue;
    }

    if (descriptionLines.length < 4) {
      descriptionLines.push(stripMarkdown(line));
      continue;
    }

    if (locationLines.length < 3) {
      locationLines.push(stripMarkdown(line));
    }
  }

  return {
    title,
    dateLabel,
    description: descriptionLines.join(' ').trim(),
    location: locationLines.join(' ').trim(),
    imageUrl,
    extraCategory: normalizeCultureCategory(`${title} ${descriptionLines.join(' ')} ${locationLines.join(' ')}`),
  };
};

const fetchTurkirovEvents = async (): Promise<TEventItem[]> => {
  const listPages = (
    await Promise.allSettled(TURKIROV_SOURCE_PAGES.map(async (pagePath) => fetchTurkirovMarkdown(pagePath)))
  ).flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));

  const rawItems = listPages.flatMap(parseTurkirovList);
  const uniqueItems = new Map<string, TTurkirovListItem>();

  for (const item of rawItems) {
    if (!uniqueItems.has(item.detailUrl)) {
      uniqueItems.set(item.detailUrl, item);
    }
  }

  const resolved: TEventItem[] = [];

  for (const group of chunk([...uniqueItems.values()], 4)) {
    const detailedGroup = await Promise.all(
      group.map(async (item) => {
        try {
          const markdown = await fetchTurkirovMarkdown(item.detailUrl);
          const detail = parseTurkirovDetail(markdown);
          const date = detail.dateLabel || item.dateLabel;
          const time = detail.timeLabel || item.timeLabel;
          const imageUrl = detail.imageUrl || item.imageUrl;
          const sortTimestamp = parseDateLabelToTimestamp(date, time);
          const location = detail.location || 'Киров';
          const description = detail.description || `${item.category} в Кирове`;

          return {
            id: encodeEventId(item.detailUrl),
            title: detail.title || item.title,
            category: item.category,
            sortTimestamp: Number.isFinite(sortTimestamp) ? sortTimestamp : Number.POSITIVE_INFINITY,
            date,
            time,
            location,
            description,
            artistDescription: '',
            imageUrl,
            link: new URL(item.detailUrl, TURKIROV_BASE_URL).toString(),
          } satisfies TEventItem;
        } catch {
          const date = item.dateLabel;
          const time = item.timeLabel;
          const sortTimestamp = parseDateLabelToTimestamp(date, time);

          return {
            id: encodeEventId(item.detailUrl),
            title: item.title,
            category: item.category,
            sortTimestamp: Number.isFinite(sortTimestamp) ? sortTimestamp : Number.POSITIVE_INFINITY,
            date,
            time,
            location: 'Киров',
            description: item.category,
            artistDescription: '',
            imageUrl: item.imageUrl,
            link: new URL(item.detailUrl, TURKIROV_BASE_URL).toString(),
          } satisfies TEventItem;
        }
      })
    );

    resolved.push(...detailedGroup);
  }

  return resolved;
};

const fetchCulturaEvents = async (): Promise<TEventItem[]> => {
  const markdownPages = (
    await Promise.allSettled([
      fetchCulturaMarkdown('/afisha/'),
      fetchCulturaMarkdown('/afisha/?PAGEN_1=2'),
      fetchCulturaMarkdown('/afisha/?PAGEN_1=3'),
      fetchCulturaMarkdown('/afisha/?PAGEN_1=4'),
    ])
  ).flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));

  const rawItems = markdownPages.flatMap(parseCulturaList);
  const uniqueItems = new Map<string, TCulturaListItem>();

  for (const item of rawItems) {
    if (!uniqueItems.has(item.detailUrl)) {
      uniqueItems.set(item.detailUrl, item);
    }
  }

  const resolved: TEventItem[] = [];

  for (const group of chunk([...uniqueItems.values()], 4)) {
    const detailedGroup = await Promise.all(
      group.map(async (item) => {
        try {
          const markdown = await fetchCulturaMarkdown(toCulturaPath(item.detailUrl));
          const detail = parseCulturaDetail(markdown);
          const date = detail.dateLabel || 'Актуально';
          const sortTimestamp = parseDateLabelToTimestamp(date, '');
          const category = detail.extraCategory === 'афиша' ? normalizeCultureCategory(item.title) : detail.extraCategory;

          return {
            id: encodeEventId(item.detailUrl),
            title: detail.title || item.title,
            category,
            sortTimestamp: Number.isFinite(sortTimestamp) ? sortTimestamp : Number.POSITIVE_INFINITY,
            date,
            time: '',
            location: detail.location || item.title,
            description: detail.description || item.title,
            artistDescription: '',
            imageUrl: detail.imageUrl || '',
            link: new URL(item.detailUrl, CULTURA_BASE_URL).toString(),
          } satisfies TEventItem;
        } catch {
          return {
            id: encodeEventId(item.detailUrl),
            title: item.title,
            category: normalizeCultureCategory(item.title),
            sortTimestamp: Number.POSITIVE_INFINITY,
            date: 'Актуально',
            time: '',
            location: item.title,
            description: item.title,
            artistDescription: '',
            imageUrl: '',
            link: new URL(item.detailUrl, CULTURA_BASE_URL).toString(),
          } satisfies TEventItem;
        }
      })
    );

    resolved.push(...detailedGroup);
  }

  return resolved;
};

const fetchAfishaEventDetail = async (item: TRawParsedItem): Promise<TEventItem> => {
  const absoluteUrl = new URL(item.link, AFISHA_BASE_URL).toString();
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

const fetchAfishaPageItems = async (pagePath: string): Promise<TRawParsedItem[]> => {
  const html = await fetchHtml(new URL(pagePath, AFISHA_BASE_URL).toString());
  return parsePageItems(html);
};

const fetchAfishaCinemaPageItems = async (): Promise<TCinemaListItem[]> => {
  const html = await fetchHtml(new URL('/kirov/cinema/', AFISHA_BASE_URL).toString());
  return parseCinemaListItems(html);
};

const fetchAfishaCinemaEventDetail = async (item: TCinemaListItem): Promise<TEventItem> => {
  const absoluteMovieUrl = new URL(item.movieUrl, AFISHA_BASE_URL).toString();
  const absoluteScheduleUrl = new URL(item.scheduleUrl, AFISHA_BASE_URL).toString();
  const html = await fetchHtml(absoluteScheduleUrl);
  const scheduleInfo = extractCinemaScheduleInfo(html);
  const title = item.title || extractTitle(html);
  const description = item.description || extractMetaContent(html, ['description', 'og:description', 'twitter:description']);
  const imageUrl = extractMetaContent(html, ['og:image', 'twitter:image']) || item.imageUrl;
  const minScheduleDate = scheduleInfo ? parseIsoDate(scheduleInfo.minScheduleDate) : null;
  const maxScheduleDate = scheduleInfo ? parseIsoDate(scheduleInfo.maxScheduleDate) : null;
  const safeStartDate = minScheduleDate ?? maxScheduleDate;
  const safeEndDate = maxScheduleDate ?? minScheduleDate;
  const date = safeStartDate && safeEndDate ? formatRussianDateRange(safeStartDate, safeEndDate) : 'Актуально';
  const sortTimestamp = safeStartDate?.getTime() ?? Number.POSITIVE_INFINITY;
  const location = scheduleInfo?.places || 'Кино в Кирове';

  return {
    id: encodeEventId(item.scheduleUrl || item.movieUrl),
    title,
    category: 'кино',
    sortTimestamp,
    date,
    time: '',
    location,
    description,
    artistDescription: '',
    imageUrl,
    link: absoluteScheduleUrl || absoluteMovieUrl,
  };
};

const fetchAfishaCinemaEvents = async (): Promise<TEventItem[]> => {
  const pageItems = await fetchAfishaCinemaPageItems();
  const enrichedItems: TEventItem[] = [];

  for (const group of chunk(pageItems, 4)) {
    const resolved = await Promise.all(
      group.map(async (item) => {
        try {
          return await fetchAfishaCinemaEventDetail(item);
        } catch {
          return {
            id: encodeEventId(item.scheduleUrl || item.movieUrl),
            title: item.title,
            category: 'кино',
            sortTimestamp: Number.POSITIVE_INFINITY,
            date: 'Актуально',
            time: '',
            location: 'Кино в Кирове',
            description: item.description || item.title,
            artistDescription: '',
            imageUrl: item.imageUrl,
            link: new URL(item.scheduleUrl || item.movieUrl, AFISHA_BASE_URL).toString(),
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

const fetchAfishaEvents = async (): Promise<TEventItem[]> => {
  const sourcePages = (
    await Promise.allSettled(AFISHA_SOURCE_PAGES.map(async (pagePath) => fetchAfishaPageItems(pagePath)))
  ).flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
  const uniqueItems = new Map<string, TRawParsedItem>();

  for (const pageItems of sourcePages) {
    for (const item of pageItems) {
      if (!uniqueItems.has(item.link)) {
        uniqueItems.set(item.link, item);
      }
    }
  }

  const rawItems = [...uniqueItems.values()];
  const enrichedItems: TEventItem[] = [];

  for (const group of chunk(rawItems, 4)) {
    const resolved = await Promise.all(
      group.map(async (item) => {
        try {
          return await fetchAfishaEventDetail(item);
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
            link: new URL(item.link, AFISHA_BASE_URL).toString(),
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

const loadEvents = async (selectedDateKey?: string): Promise<TEventItem[]> => {
  const [culturaEvents, turkirovEvents, afishaEvents, cinemaEvents] = await Promise.allSettled([
    fetchCulturaEvents(),
    fetchTurkirovEvents(),
    fetchAfishaEvents(),
    fetchAfishaCinemaEvents(),
  ]);

  const combined = [
    ...(culturaEvents.status === 'fulfilled' ? culturaEvents.value : []),
    ...(turkirovEvents.status === 'fulfilled' ? turkirovEvents.value : []),
    ...(afishaEvents.status === 'fulfilled' ? afishaEvents.value : []),
    ...(cinemaEvents.status === 'fulfilled' ? cinemaEvents.value : []),
  ];

  const normalizedCombined = combined
    .filter((item) => !(isCultureSourceLink(item.link) && isGenericCulturePage(item.title)))
    .map((item) => {
      if (!isCultureSourceLink(item.link)) {
        return item;
      }

      return {
        ...item,
        category: classifyCultureEvent(item.title, item.description, item.category),
      };
    });
  const windowedCombined = normalizedCombined.filter((item) => isEventInVisibleWindow(item));

  const uniqueItems = new Map<string, TEventItem>();

  for (const item of windowedCombined) {
    if (!uniqueItems.has(item.id)) {
      uniqueItems.set(item.id, item);
    }
  }

  const filteredItems = [...uniqueItems.values()].filter((item) => (selectedDateKey ? isEventOnDate(item, selectedDateKey) : true));

  return filteredItems
    .sort((left, right) => {
      if (left.sortTimestamp !== right.sortTimestamp) {
        return left.sortTimestamp - right.sortTimestamp;
      }

      return left.title.localeCompare(right.title, 'ru');
    });
};

export const getParserEvents = async (selectedDateKey?: string, forceRefresh = false): Promise<TEventItem[]> => {
  const normalizedDateKey = selectedDateKey ? parseDateFilterKey(selectedDateKey) : '';

  if (!forceRefresh && !normalizedDateKey && eventsCache && Date.now() - eventsCache.timestamp < CACHE_TTL_MS) {
    return eventsCache.value;
  }

  const value = await loadEvents(normalizedDateKey || undefined);

  if (!normalizedDateKey) {
    eventsCache = {
      timestamp: Date.now(),
      value,
    };

    return value;
  }

  if (eventsCache) {
    const cachedDateItems = eventsCache.value.filter((item) => isEventOnDate(item, normalizedDateKey));
    const mergedItems = new Map<string, TEventItem>();

    for (const item of [...cachedDateItems, ...value]) {
      mergedItems.set(item.id, item);
    }

    return [...mergedItems.values()]
      .sort((left, right) => {
        if (left.sortTimestamp !== right.sortTimestamp) {
          return left.sortTimestamp - right.sortTimestamp;
        }

        return left.title.localeCompare(right.title, 'ru');
      });
  }

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
