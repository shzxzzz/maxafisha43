export type TEventItem = {
  id: string;
  title: string;
  category: string;
  sortTimestamp: number;
  date: string;
  time: string;
  location: string;
  description: string;
  artistDescription: string;
  imageUrl: string;
  link: string;
};

type TParserEventsResponse = {
  items: TEventItem[];
};

type TParserEventResponse = {
  item: TEventItem;
};

const API_BASE = '/api/parser';

const encodeRouteParam = (value: string): string => {
  try {
    return encodeURIComponent(decodeURIComponent(value));
  } catch {
    return encodeURIComponent(value);
  }
};

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const fetchParserEvents = async (): Promise<TEventItem[]> => {
  const response = await fetch(`${API_BASE}/events`);
  const data = await parseJsonResponse<TParserEventsResponse>(response);

  return data.items;
};

export const fetchParserEvent = async (eventId?: string): Promise<TEventItem | undefined> => {
  if (!eventId) {
    return undefined;
  }

  const response = await fetch(`${API_BASE}/events/${encodeRouteParam(eventId)}`);

  if (response.status === 404) {
    return undefined;
  }

  const data = await parseJsonResponse<TParserEventResponse>(response);

  return data.item;
};
