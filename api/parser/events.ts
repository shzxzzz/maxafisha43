import type { IncomingMessage, ServerResponse } from 'http';

import { readCachedParserEvents } from './cache';

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
    const items = await readCachedParserEvents();
    sendJson(response, 200, { items });
  } catch (error) {
    const fallbackItems = [];

    sendJson(response, 500, {
      message: error instanceof Error ? error.message : 'Parser API failed',
      items: fallbackItems,
    });
  }
}
