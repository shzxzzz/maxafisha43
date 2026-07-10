import type { IncomingMessage, ServerResponse } from 'http';

import { readCachedParserEvents } from '../cache';

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
    const item = (await readCachedParserEvents()).find((event) => event.id === eventId);

    if (!item) {
      sendJson(response, 404, { message: 'Event not found' });
      return;
    }

    sendJson(response, 200, { item });
  } catch (error) {
    sendJson(response, 500, {
      message: error instanceof Error ? error.message : 'Parser API failed',
    });
  }
}
