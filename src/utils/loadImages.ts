import noop from './noop';

/**
 * Функция для загрузки изображения через image.onload через промис
 * @param {string} src image.src
 * @param {VoidFunction} onLoaded Колбэк на успешную загрузку изображения
 * @returns true при успехе, false при ошибке загрузки
 */
export const loadImage = async (src: string, onLoaded?: VoidFunction): Promise<boolean> =>
  new Promise<boolean>((resolve) => {
    const curImage = new Image();

    curImage.src = src;

    curImage.onload = () => {
      onLoaded?.();
      resolve(true);
    };

    curImage.onerror = () => resolve(false);
  });

/**
 * Утилита для асинхронной загрузки изображений
 * @param {string[]} images Массив image.src
 * @param {VoidFunction} onNextLoaded Колбэк, который вызывается после успешной загрузки каждого изображения
 */
export default async (images: string[], onNextLoaded: VoidFunction = noop): Promise<void> => {
  await Promise.all(images.map((i) => loadImage(i, onNextLoaded)));
};

/**
 * Предзагружает изображения с одним повтором при ошибке.
 * Если после повтора картинка не загрузилась — выбрасывает ошибку.
 */
export const loadImagesWithRetry = async (images: string[]): Promise<void> => {
  await Promise.all(
    images.map(async (src) => {
      let ok = await loadImage(src);

      if (!ok) {
        ok = await loadImage(src);
      }

      if (!ok) {
        throw new Error('Image failed to load after retry');
      }
    })
  );
};
