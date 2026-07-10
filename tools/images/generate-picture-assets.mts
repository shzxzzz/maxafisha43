import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { globSync } from 'glob';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const SOURCE_DIR = path.join(ROOT, 'src/assets/images/sources');
const OUTPUT_DIR = path.join(ROOT, 'src/assets/images/pictureAssets');

const SOURCE_EXTENSIONS = ['jpg', 'jpeg', 'png'];
const SOURCE_PATTERN = `**/*.{${SOURCE_EXTENSIONS.join(',')}}`;

const WEBP_QUALITY = 80;
const JPEG_QUALITY = 80;

/** Паттерн имён сгенерированных файлов: *_1x.* и *_2x.* */
const GENERATED_PATTERN = `**/*_{1,2}x.{jpg,jpeg,png,webp}`;

function removeGeneratedFiles(): void {
  if (!fs.existsSync(OUTPUT_DIR)) return;

  const toRemove = globSync(GENERATED_PATTERN, {
    cwd: OUTPUT_DIR,
    absolute: true,
  });

  for (const file of toRemove) {
    fs.unlinkSync(file);
  }
}

const TTY = process.stderr.isTTY;
const RED = TTY ? '\x1b[31m' : '';
const YELLOW = TTY ? '\x1b[33m' : '';
const RESET = TTY ? '\x1b[0m' : '';

function logMessage(message: string): string {
  return `[generate-picture-assets] ${message}`;
}

function logError(message: string): void {
  console.error(`${RED}${logMessage(message)}${RESET}`);
}

function logWarn(message: string): void {
  console.warn(`${YELLOW}${logMessage(message)}${RESET}`);
}

/**
 * Проверяет, есть ли в одной директории изображения с одинаковым именем, но разным форматом.
 * В таком случае генерируется только один вариант webp (последний перезаписывает остальные).
 */
function checkDuplicateBasenames(files: string[]): void {
  const byDir = new Map<string, Map<string, string[]>>();

  for (const file of files) {
    const relativePath = path.relative(SOURCE_DIR, file);
    const dir = path.dirname(relativePath);
    const basename = path.basename(file, path.extname(file));
    const ext = path.extname(file).toLowerCase().replace(/^\./, '');

    if (!byDir.has(dir)) {
      byDir.set(dir, new Map());
    }
    const dirMap = byDir.get(dir)!;
    if (!dirMap.has(basename)) {
      dirMap.set(basename, []);
    }
    dirMap.get(basename)!.push(ext);
  }

  for (const [dir, dirMap] of byDir) {
    for (const [basename, exts] of dirMap) {
      const unique = [...new Set(exts)];
      if (unique.length > 1) {
        const dirLabel = dir || '(корень sources)';
        logError(
          `Ошибка: в одной директории найдены изображения с одинаковым именем, но разным форматом — будет сгенерирован только один вариант webp. Директория: ${dirLabel}, имя: "${basename}", форматы: ${unique.join(', ')}`
        );
      }
    }
  }
}

async function processImage(sourcePath: string): Promise<void> {
  const relativePath = path.relative(SOURCE_DIR, sourcePath);
  const relativeDir = path.dirname(relativePath);
  const ext = path.extname(sourcePath).toLowerCase().replace(/^\./, '');
  const basename = path.basename(sourcePath, path.extname(sourcePath));

  const outputDir = path.join(OUTPUT_DIR, relativeDir);
  fs.mkdirSync(outputDir, { recursive: true });

  const outExt = ext === 'jpeg' ? 'jpg' : ext;
  const outBase = path.join(outputDir, basename);

  // Если в названии уже есть _1x или _2x — только конвертируем в WebP, без ресайза
  if (basename.endsWith('_1x') || basename.endsWith('_2x')) {
    fs.copyFileSync(sourcePath, `${outBase}.${outExt}`);
    await sharp(sourcePath)
      .webp({ quality: WEBP_QUALITY })
      .toFile(`${outBase}.webp`);
    return;
  }

  const pipeline = sharp(sourcePath);
  const metadata = await pipeline.metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  if (width === 0 || height === 0) {
    logWarn(`Пропуск (нет размеров): ${relativePath}`);
    return;
  }

  const halfWidth = Math.round(width / 2);
  const halfHeight = Math.round(height / 2);

  const isPng = ext === 'png';
  const formatOptions = isPng ? {} : { quality: JPEG_QUALITY };

  // 1x PNG/JPEG: lanczos2 + лёгкий sharpen (PNG sigma 0.3, JPEG sigma 0.5 + gamma)
  // 1x WebP: конвертируется из готового _1x.png / _1x.jpg
  const resize1xOptions = {
    kernel: 'lanczos2' as const,
    fastShrinkOnLoad: false,
  };
  const sharpenPng = { sigma: 0.3 };
  const sharpenPhoto = { sigma: 0.5 };
  const sharpen1x = isPng ? sharpenPng : sharpenPhoto;

  let resize1x = pipeline
    .clone()
    .resize(halfWidth, halfHeight, resize1xOptions)
    .sharpen(sharpen1x);

  if (!isPng) {
    resize1x = pipeline.clone().gamma().resize(halfWidth, halfHeight, resize1xOptions).sharpen(sharpen1x);
  }

  await Promise.all([
    pipeline
      .clone()
      .toFormat(isPng ? 'png' : 'jpeg', formatOptions)
      .toFile(`${outBase}_2x.${outExt}`),
    resize1x
      .toFormat(isPng ? 'png' : 'jpeg', formatOptions)
      .toFile(`${outBase}_1x.${outExt}`),
    pipeline
      .clone()
      .webp({ quality: WEBP_QUALITY })
      .toFile(`${outBase}_2x.webp`),
  ]);

  const resize1xPath = `${outBase}_1x.${outExt}`;
  await sharp(resize1xPath)
    .webp({ quality: WEBP_QUALITY })
    .toFile(`${outBase}_1x.webp`);
}

async function run(): Promise<void> {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.log(logMessage(`Папка источников не найдена: ${SOURCE_DIR}`));
    return;
  }

  const files = globSync(SOURCE_PATTERN, {
    cwd: SOURCE_DIR,
    absolute: true,
  });

  removeGeneratedFiles();

  if (files.length === 0) {
    console.log(logMessage('Нет изображений для обработки в sources.'));
    return;
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const file of files) {
    try {
      await processImage(file);
      console.log(logMessage(`Обработан: ${path.relative(SOURCE_DIR, file)}`));
    } catch (err) {
      logError(`Ошибка ${file}:`);
      console.error(err);
    }
  }

  checkDuplicateBasenames(files);
}

void run();
