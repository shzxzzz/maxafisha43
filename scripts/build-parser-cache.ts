import { writeFile } from 'fs/promises';
import path from 'path';

import { getParserEvents } from '../src/pages/ParserPage/backend/scraper';

const CACHE_PATH = path.resolve(process.cwd(), 'static', 'parser-events-cache.json');

const buildCache = async () => {
  const items = await getParserEvents();

  await writeFile(
    CACHE_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        items,
      },
      null,
      2
    ),
    'utf8'
  );
};

buildCache().catch((error) => {
  console.error(error);
  process.exit(1);
});
