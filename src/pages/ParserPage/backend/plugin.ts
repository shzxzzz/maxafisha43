import type { Plugin } from 'vite';

import { getParserEvent, getParserEvents } from './scraper';

const sendJson = (statusCode: number, payload: unknown, response: import('http').ServerResponse) => {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
};

const handleRequest = async (request: import('http').IncomingMessage, response: import('http').ServerResponse) => {
  if (!request.url || request.method !== 'GET') {
    return false;
  }

  const url = new URL(request.url, 'http://localhost');
  const { pathname } = url;
  const eventsBasePath = '/api/parser/events';

  if (pathname === eventsBasePath) {
    const items = await getParserEvents();
    sendJson(200, { items }, response);

    return true;
  }

  if (pathname.startsWith(`${eventsBasePath}/`)) {
    const eventId = pathname.slice(`${eventsBasePath}/`.length);
    const item = await getParserEvent(eventId);

    if (!item) {
      sendJson(404, { message: 'Event not found' }, response);

      return true;
    }

    sendJson(200, { item }, response);

    return true;
  }

  return false;
};

const parserApiMiddleware = () =>
  async (
    request: import('http').IncomingMessage,
    response: import('http').ServerResponse,
    next: (error?: unknown) => void
  ) => {
    try {
      const handled = await handleRequest(request, response);

      if (!handled) {
        next();
      }
    } catch (error) {
      sendJson(
        500,
        {
          message: error instanceof Error ? error.message : 'Parser API failed',
        },
        response
      );
    }
  };

export const createParserApiPlugin = (): Plugin => ({
  name: 'parser-api',
  configureServer(server) {
    server.middlewares.use(parserApiMiddleware());
  },
  configurePreviewServer(server) {
    server.middlewares.use(parserApiMiddleware());
  },
});
