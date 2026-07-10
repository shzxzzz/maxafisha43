/**
 * Глобальный объект, связывает мини-приложение с клиентом
 * @link https://dev.max.ru/docs/webapps/bridge#Window.WebApp
 */
export interface MaxWebApp {
  /**
   * Строка со стартовыми параметрами веб-приложения.
   * С этим полем совпадает объект WebAppInitData,
   * который может быть полезен при необходимости отображения данных о пользователе в UI.
   */
  readonly initData: string;

  /** Объект со стартовыми параметрами. Не должен использоваться для валидации пользователя. */
  readonly initDataUnsafe: MaxWebAppInitData;

  /** Подписка на событие с использованием callback */
  readonly onEvent: MaxOnEvent;

  /** Метод, который сообщает Max, что веб-приложение готово к работе (скрывается экран с загрузкой) */
  readonly ready: () => void;

  /** Закрытие веб-приложения */
  readonly close: () => void;

  /** Запрос номера телефона у пользователя в нативном диалоговом окне */
  readonly requestContact: () => void;

  /** Объект для управления кнопкой «Назад», которая может отображаться в заголовке веб-приложения в интерфейсе Max */
  readonly BackButton: MaxBackButton;

  /** Предупреждать пользователя, что введённые данные будут утеряны, если закрыть окно веб-приложения */
  readonly enableClosingConfirmation: () => void;

  /** Не предупреждать, что введённые данные будут утеряны, если закрыть окно веб-приложения */
  readonly disableClosingConfIrmation: () => void;

  /** Откроет ссылку во внешнем браузере */
  readonly openLink: (link: string) => void;

  /** Открытие диплинка связанного с max.ru */
  readonly openMaxLink: (link: string) => void;
}

/**
 * Объект содержит данные, которые мини-приложение получает при запуске
 * @link https://dev.max.ru/docs/webapps/bridge#WebAppData
 */
export interface MaxWebAppInitData {
  /** Уникальный идентификатор сессии мини-приложения */
  readonly query_id: string;

  /** Время получения данных с бэкенда */
  readonly auth_date: number;

  /** Хэш переданных параметров, который можно использовать для проверки их достоверности */
  readonly hash: string;

  /** Объект с дополнительными данными */
  readonly start_param: MaxWebAppStartParam;

  /** Объект с данными о пользователе, который открывает мини-приложение */
  readonly user: MaxWebAppUser;

  /** Объект с данными о чате, из которого открыто мини-приложение */
  readonly chat: {
    /** Идентификатор чата */
    readonly id: number;

    /** Тип чата */
    readonly type: string;
  };
}

export interface MaxWebAppUser {
  /** Уникальный идентификатор пользователя MAX */
  readonly id: number;

  /** Имя пользователя */
  readonly first_name: string;

  /** Фамилия пользователя */
  readonly last_name: string;

  /** Ник пользователя */
  readonly username: string;

  /** Язык интерфейса MAX */
  readonly language_code: string;

  /** Ссылка на фото профиля пользователя */
  readonly photo_url: string;
}

/** @link https://dev.max.ru/docs/webapps/bridge#WebAppStartParam */
export interface MaxWebAppStartParam {
  [key: string]: any;
}

/**
 * Объект управляет кнопкой Назад в шапке мини-приложения
 * @link https://dev.max.ru/docs/webapps/bridge#BackButton
 */
export interface MaxBackButton {
  /** Состояние кнопки «Назад». false по умолчанию */
  readonly isVisible: boolean;

  /** Устанавливает обработчик событий нажатия кнопки */
  readonly onClick: (cb: () => void) => void;

  /** Убирает обработчик событий нажатия кнопки */
  readonly offClick: (cb: () => void) => void;

  /** Делает кнопку «Назад» активной и видимой */
  readonly show: () => void;

  /** Скрывает кнопку «Назад» */
  readonly hide: () => void;
}

/**
 * События MAX Bridge
 * @link https://dev.max.ru/docs/webapps/bridge#%D0%A1%D0%BE%D0%B1%D1%8B%D1%82%D0%B8%D1%8F%20Bridge
 */
interface MaxOnEvent {
  /**
   * Сигнализирует Max, что веб-приложение готово к работе.
   * Отображается загруженная страница.
   * Если контент веб-приложения не был загружен за 15 секунд, отобразится экран с ошибкой «Нет сети»
   */
  (event: 'WebAppReady', VoidFunction): void;

  /** Сигнализирует Max, что веб-приложение нужно закрыть*/
  (event: 'WebAppClose', VoidFunction): void;

  /**
   * Управляет поведением кнопки «Назад», которая может отображаться в заголовке веб-приложения в интерфейсе Max.
   * isVisible = true — кнопка отображается
   * isVisible = false — кнопка не отображается
   */
  (event: 'WebAppSetupBackButton', VoidFunction): void;

  /**
   * Получив это событие, клиенты должны показать пользователю сообщение,
   * что веб-приложение просит его поделиться своим номером телефона.
   */
  (event: 'WebAppRequestPhone', VoidFunction): void;

  /**
   * Получив это событие, клиенты должны показать пользователю сообщение,
   * что веб-приложение просит его поделиться своим днём рождения.
   * Если день рождения не указан или указан не полностью, отправится 0 в значениях.
   */
  (event: 'WebAppRequestBirthdate', VoidFunction): void;

  /**
   * Управляет поведением окна с открытым веб- приложением.
   * needConfirmation = true — клиент должен запрашивать подтверждение пользователя с помощью всплывающего окна
   * «Внесённые вами изменения могут быть не сохранены»
   * needConfirmation = false — клиент не будет запрашивать такое подтверждение
   * Если явно не передано, запрашиваться не будет.
   */
  (event: 'WebAppSetupClosingBehavior', VoidFunction): void;

  /** Уведомление, что пользователь нажал кнопку «Назад» */
  (event: 'WebAppBackButtonPressed', VoidFunction): void;
}
