# Сервисы региона — мини-приложение для Max

Мини-приложение «Сервисы региона» агрегирует полезные сервисы, официальные каналы и новости региона в едином интерфейсе внутри платформы Max.

Условия использования. Материалы предоставлены ООО «МАХ» (ИНН 9714058267) и распространяются на условиях лицензии CC BY-NC-SA 4.0 International. Текст лицензии доступен по ссылке: https://creativecommons.org/licenses/by-nc-sa/4.0/. 
- Обязательное указание правообладателя (BY);
- Запрет коммерческого использования (NC);
- Обязанность распространять производные материалы на тех же условиях (SA).

Важная информация: Организация, принимающая решение о внедрении данного исходного кода, несет полную ответственность за его функционирование и итоговую работоспособность.

## Документация

- [Инструкция для региона: настройка мини-приложения](docs/region-instruction.md)
- [Сборка и проверка мини-приложения](docs/region-build-guide.md)
- [Справочник аналитики: события и настройка счётчиков](docs/analytics-events.md)

## Сборка production

### Node.js

- **Версия**: Node.js 20.x
- **Менеджер пакетов**: Yarn

### Установка зависимостей

```bash
yarn install
```

### Команда сборки

```bash
yarn build
```

### Результат сборки

- **Папка**: `public/`
- **Статические файлы**: `public/static/`
- **HTML**: `public/index.html`
- **JavaScript/CSS**: `public/static/` с хешированными именами файлов


## Технологии

- React
- React Router v6
- CSS Modules
- Framer Motion
- MobX
- Typescript
- Vite.js
- Eslint + Prettier + Stylelint

### Структура проекта

```
|vk-mini-app-regiony-front
|--/src
   |--/assets <- общие медиа файлы
   |--/assets/images <- общие картинки
   |--/build <- скрипты для внедрения на этапе сборки аппа
   |--/build/fonts <- конфиги и скрипты для добавления и предзагрузки шрифтов
   |--/components <- общие компоненты
   |--/config <- общие конфиги
   |--/pages <- компоненты-страниц приложения
   |--/store <- mobx-сторы
   |--/styles <- глобальные стили, общие миксины и переменные
   |--/types <- глобальные типы
   |--/utils <- общие утилиты
   |--App.tsx <- главный компонент приложения
   |- main.tsx <- точка входа в приложение
|--/static <- папка со статикой, которая копируется при сборке
|--/public <- папка со сборкой (создается при yarn build)
|--index.html
```

### Описание проекта

На старте в [main.tsx](src/main.tsx) рендерится главный компонент приложения [App](src/App.tsx) в котором подключаются провайдеры глобальных контекстов (роутинг, рут-стор и т.д.).

Навигация осуществляется с помощью [react-router v6](https://reactrouter.com/en/main/start/overview):

- все пути приложения хранятся в конфиге [RoutePath](src/config/router/paths.ts)
- структура роутинга описывается в объекте [ROUTER](src/config/router/router.tsx)
- Компонент [RootLayoutPage](src/pages/RootLayoutPage/RootLayoutPage.tsx) рендерит страницы, которые передает роутер в виде `outlet` и анимирует переходы между ними с помощью компонента [AnimatePresence](https://www.framer.com/motion/animate-presence/) из библиотеки Framer Motion

Также к проекту подключен [MobX](https://mobx.js.org/) и создан глобальный стор [RootStore](src/store/globals/RootStore/RootStore.ts), который может содержать любые подсторы.

### Настройка шрифтов на сетапе проекта

Для внедрения шрифтов используются конфиг [tools/fonts/config.ts](tools/fonts/config.ts):

```typescript
/*
  например для файлов шрифтов `SF Pro Display` и `VK Sans Display`

    path_or_url/to/font/SFProDisplay/SFProDisplay-Regular.woff
    path_or_url/to/font/SFProDisplay/SFProDisplay-Regular.woff2
    path_or_url/to/font/SFProDisplay/SFProDisplay-Bold.woff
    path_or_url/to/font/SFProDisplay/SFProDisplay-Bold.woff2
    path_or_url/to/font/VKSansDisplay/VKSansDisplay_Light.woff
    path_or_url/to/font/VKSansDisplay/VKSansDisplay_Light.woff2
    path_or_url/to/font/VKSansDisplay/VKSansDisplay_Medium.woff
    path_or_url/to/font/VKSansDisplay/VKSansDisplay_Medium.woff2

  конфиг может выглядеть так:
*/

export type Font = 'VK_SANS_DISPLAY' | 'SF_PRO_DISPLAY';

export const FONT_PROPS: Record<Font, FontProps> = {
  SF_PRO_DISPLAY: {
    name: 'SF Pro Display',
    genericFamily: 'sans-serif',
    basePath: 'path_or_url/to/font/SFProDisplay/SFProDisplay',
    variants: [
      {
        fileNamePostfix: '-Regular',
        weight: 400,
      },
      {
        fileNamePostfix: '-Bold',
        weight: 700,
      },
    ],
    formats: ['woff2'],
    display: 'swap',
  },
  VK_SANS_DISPLAY: {
    name: 'VK Sans Display',
    genericFamily: 'sans-serif',
    basePath: 'path_or_url/to/font/VKSansDisplay/VKSansDisplayy',
    variants: [
      {
        fileNamePostfix: '_Light',
        weight: 300,
      },
      {
        fileNamePostfix: '_Medium',
        weight: 500,
      },
    ],
    formats: ['woff2'],
    display: 'swap',
  },
};
```

Заполненный конфиг с помощью утилит [src/build/fonts/utils.ts](src/build/fonts/utils.ts) преобразуется в ссылки для предзагрузки и наборы правил `@font-face`, которые на этапе сборки внедряются в шаблон страницы плагином `vite-plugin-html`

Для удобства использования шрифтов в стилях можно добавить простые миксины с ними в файл [src/styles/typography.scss](src/styles/typography.scss):

```scss
/// Задает основной шрифт: **SF Pro Display**
///
/// @param {number} $weight
///   Допустимые значения 400, 700
@mixin font-primary($weight: 400) {
  font-family: 'SF Pro Display', sans-serif;
  font-weight: $weight;
}
```

### Особенности работы с SVG

Результат импортирования SVG файла зависит от наличия/отсутствия специального параметра в пути, и от его размера:

- Для получения react-компонента в конец пути к файлу нужно добавить параметр `react`: `path/to/image.svg?react`
- Без параметра в пути, в зависимости от размера файла, будет получена ссылка или base64-строка на изображение

Для примера:

```typescript
import logoImg from 'assets/images/logo.svg';
import LogoComponent from 'assets/images/logo.svg?react';

const Demo: React.FC = () => (
  <div>
    <img src={logoImg} alt="logo" className="logo" />
    <LogoComponent  className="logo" />
  </div>
);
```

### Основные скрипты

- Запуск dev-сервера:

```
yarn dev
```

- Сборка:

```
yarn build
```

- Запуск eslint:

```
yarn lint
```

или

```
yarn lint:fix
```

- Запуск stylelint:

```
yarn stylelint
```

или

```
yarn stylelint:fix
```

- Запуск ts:

```
yarn tsc:check
```
