import type { IncomingMessage, ServerResponse } from 'http';

import { getParserEvents } from '../../src/pages/ParserPage/backend/scraper';
import { getCachedParserEvents } from '../../src/pages/ParserPage/backend/cache';

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

  try {
    if (process.env.VERCEL) {
      sendJson(response, 200, { items: getCachedParserEvents() });
      return;
    }

    const items = await getParserEvents();
    sendJson(response, 200, { items });
  } catch (error) {
    const cachedItems = getCachedParserEvents();

    if (cachedItems.length > 0) {
      sendJson(response, 200, { items: cachedItems });
      return;
    }

    sendJson(response, 500, {
      message: error instanceof Error ? error.message : 'Parser API failed',
    });
  }
}
