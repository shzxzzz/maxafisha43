export enum EAnalyticsEvent {
  /** Запуск приложения (при инициализации) */
  appOpen = 'app_open',
  /** Ввод поискового запроса (params: query) */
  searchQuery = 'search_query',
  /** Поисковый запрос без результатов (params: query) */
  searchEmpty = 'search_empty',
  /** Клик по карточке сервиса в списке (params: serviceId, categoryId?) */
  serviceClick = 'service_click',
  /** Нажатие кнопки «Открыть» на странице сервиса (params: serviceId) */
  serviceOpen = 'service_open',
  /** Клик по категории на главной (params: categoryId) */
  categoryClick = 'category_click',
  /** Клик по каналу в карусели на главной (params: channelId) */
  channelClick = 'channel_click',
  /** Клик по элементу блока поддержки (params: supportType, link) */
  supportClick = 'support_click',
}
