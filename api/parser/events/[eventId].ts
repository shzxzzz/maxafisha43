import type { IncomingMessage, ServerResponse } from 'http';

import { getParserEvent } from '../../../src/pages/ParserPage/backend/scraper';
import { getCachedParserEvents } from '../../../src/pages/ParserPage/backend/cache';

const sendJson = (response: ServerResponse, statusCode: number, payload: unknown) => {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
};

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') {
    sendJson(response, 405, { message: 'Method not allowed' });
    return;
  }

  const url = new URL(request.url ?? '', 'http://localhost');
  const eventId = url.pathname.split('/').pop();

  try {
    if (process.env.VERCEL) {
      const item = getCachedParserEvents().find((event) => event.id === eventId);

      if (!item) {
        sendJson(response, 404, { message: 'Event not found' });
        return;
      }

      sendJson(response, 200, { item });
      return;
    }

    const item = await getParserEvent(eventId);

    if (!item) {
      sendJson(response, 404, { message: 'Event not found' });
      return;
    }

    sendJson(response, 200, { item });
  } catch (error) {
    const cachedItem = getCachedParserEvents().find((event) => event.id === eventId);

    if (cachedItem) {
      sendJson(response, 200, { item: cachedItem });
      return;
    }

    sendJson(response, 500, {
      message: error instanceof Error ? error.message : 'Parser API failed',
    });
  }
}
