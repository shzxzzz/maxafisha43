import { motion } from 'framer-motion';
import * as React from 'react';

import { Button, IconButton, Page, ScreenSpinner, SearchInput, Typography } from 'components/common';
import { Icon, EIconType } from 'components/common/icons';
import { ERoutePath } from 'config/router';
import { useRouterStore } from 'store/hooks';
import { useDebounce } from 'utils/hooks';

import { fetchParserEvents, TEventItem } from './data';
import s from './ParserPage.module.scss';

const monthFormatter = new Intl.DateTimeFormat('ru-RU', {
  month: 'long',
  year: 'numeric',
});

const DATE_FILTER_VISIBLE_MONTHS = 2;

const CATEGORY_ORDER = [
  'cinema',
  'concert',
  'standup',
  'theatre',
  'festival',
  'exhibition',
  'museum',
  'lecture',
  'excursion',
  'masterclass',
  'kids',
  'other',
] as const;

const CATEGORY_LABELS: Record<(typeof CATEGORY_ORDER)[number] | 'all', string> = {
  all: 'Все',
  cinema: 'Кино',
  concert: 'Концерт',
  standup: 'Стендап',
  theatre: 'Театр',
  festival: 'Фестиваль',
  exhibition: 'Выставка',
  museum: 'Музей',
  lecture: 'Лекция',
  excursion: 'Экскурсия',
  masterclass: 'Мастер-класс',
  kids: 'Детям',
  other: 'Другое',
};

const toLocalDateKey = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

const getCategoryKey = (value: string): (typeof CATEGORY_ORDER)[number] => {
  const normalized = value.trim().toLowerCase();

  if (
    normalized.includes('кино') ||
    normalized.includes('фильм') ||
    normalized.includes('кин')
  ) {
    return 'cinema';
  }

  if (normalized.includes('концерт') || normalized.includes('музык')) {
    return 'concert';
  }

  if (normalized.includes('стендап') || normalized.includes('юмор') || normalized.includes('комед')) {
    return 'standup';
  }

  if (normalized.includes('театр') || normalized.includes('спектак') || normalized.includes('постанов')) {
    return 'theatre';
  }

  if (normalized.includes('фестиваль')) {
    return 'festival';
  }

  if (normalized.includes('выстав')) {
    return 'exhibition';
  }

  if (normalized.includes('музе')) {
    return 'museum';
  }

  if (normalized.includes('лекц')) {
    return 'lecture';
  }

  if (normalized.includes('экскурс')) {
    return 'excursion';
  }

  if (normalized.includes('мастер') || normalized.includes('творческ')) {
    return 'masterclass';
  }

  if (normalized.includes('дет')) {
    return 'kids';
  }

  return 'other';
};

const ParserPage: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const [events, setEvents] = React.useState<TEventItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedDate, setSelectedDate] = React.useState('');
  const [selectedCategories, setSelectedCategories] = React.useState<Array<(typeof CATEGORY_ORDER)[number]>>([]);
  const [canScrollDatesBackward, setCanScrollDatesBackward] = React.useState(false);
  const [canScrollDatesForward, setCanScrollDatesForward] = React.useState(false);
  const [canScrollCategoriesBackward, setCanScrollCategoriesBackward] = React.useState(false);
  const [canScrollCategoriesForward, setCanScrollCategoriesForward] = React.useState(false);
  const datesTrackRef = React.useRef<HTMLDivElement>(null);
  const categoriesTrackRef = React.useRef<HTMLDivElement>(null);
  const { push } = useRouterStore();
  const debouncedQuery = useDebounce(query, 180);

  const loadEvents = React.useCallback(async (dateKey?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchParserEvents(dateKey);
      setEvents(response);
    } catch {
      setEvents([]);
      setError('Не удалось загрузить события. Проверьте подключение и попробуйте ещё раз.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const dateSegments = React.useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today.getFullYear(), today.getMonth() + DATE_FILTER_VISIBLE_MONTHS, 0);
    const days: Array<{ key: string; date: Date; monthLabel: string }> = [];

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const nextDate = new Date(date);

      days.push({
        key: toLocalDateKey(nextDate),
        date: nextDate,
        monthLabel: capitalize(monthFormatter.format(nextDate)),
      });
    }

    const segments: Array<{ key: string; monthLabel: string; days: typeof days }> = [];

    for (const item of days) {
      const lastSegment = segments[segments.length - 1];

      if (!lastSegment || lastSegment.monthLabel !== item.monthLabel) {
        segments.push({
          key: `${item.key}-segment`,
          monthLabel: item.monthLabel,
          days: [item],
        });
      } else {
        lastSegment.days.push(item);
      }
    }

    return segments;
  }, []);

  const syncDateScrollButtons = React.useCallback(() => {
    const container = datesTrackRef.current;

    if (!container) {
      setCanScrollDatesBackward(false);
      setCanScrollDatesForward(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);

    setCanScrollDatesBackward(scrollLeft > 4);
    setCanScrollDatesForward(scrollLeft < maxScrollLeft - 4);
  }, []);

  React.useEffect(() => {
    syncDateScrollButtons();

    const container = datesTrackRef.current;

    if (!container) {
      return undefined;
    }

    const handleScroll = () => {
      syncDateScrollButtons();
    };

    const handleResize = () => {
      syncDateScrollButtons();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [syncDateScrollButtons]);

  const handleDateTrackScroll = React.useCallback((direction: 'backward' | 'forward') => {
    const container = datesTrackRef.current;

    if (!container) {
      return;
    }

    const offset = Math.max(220, Math.round(container.clientWidth * 0.8));

    container.scrollBy({
      left: direction === 'backward' ? -offset : offset,
      behavior: 'smooth',
    });
  }, []);

  const normalizedQuery = debouncedQuery.trim().toLowerCase();

  const filteredEvents = React.useMemo(() => {
    if (!normalizedQuery) {
      return events;
    }

    return events.filter((event) => {
      const searchableText = [
        event.title,
        event.category,
        event.date,
        event.time,
        event.location,
        event.description,
        event.artistDescription,
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [events, normalizedQuery]);

  const categoryCounts = React.useMemo(() => {
    const counts = new Map<(typeof CATEGORY_ORDER)[number], number>();

    for (const event of events) {
      const categoryKey = getCategoryKey(event.category);
      counts.set(categoryKey, (counts.get(categoryKey) ?? 0) + 1);
    }

    return counts;
  }, [events]);

  const orderedCategoryOptions = React.useMemo(() => {
    const available = CATEGORY_ORDER.filter((categoryKey) => (categoryCounts.get(categoryKey) ?? 0) > 0);
    const empty = CATEGORY_ORDER.filter((categoryKey) => (categoryCounts.get(categoryKey) ?? 0) === 0);

    return ['all', ...available, ...empty] as const;
  }, [categoryCounts]);

  const visibleEvents = React.useMemo(() => {
    if (selectedCategories.length === 0) {
      return filteredEvents;
    }

    return filteredEvents.filter((event) => selectedCategories.includes(getCategoryKey(event.category)));
  }, [filteredEvents, selectedCategories]);

  const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  }, []);

  const handleDateSelect = React.useCallback(
    (dateKey: string) => {
      setSelectedDate(dateKey);
      void loadEvents(dateKey);
    },
    [loadEvents]
  );

  const handleDateReset = React.useCallback(() => {
    setSelectedDate('');
    void loadEvents();
  }, [loadEvents]);

  const handleCategorySelect = React.useCallback((categoryKey: 'all' | (typeof CATEGORY_ORDER)[number]) => {
    if (categoryKey === 'all') {
      setSelectedCategories([]);
      return;
    }

    setSelectedCategories((current) =>
      current.includes(categoryKey) ? current.filter((item) => item !== categoryKey) : [...current, categoryKey]
    );
  }, []);

  const syncCategoryScrollButtons = React.useCallback(() => {
    const container = categoriesTrackRef.current;

    if (!container) {
      setCanScrollCategoriesBackward(false);
      setCanScrollCategoriesForward(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);

    setCanScrollCategoriesBackward(scrollLeft > 4);
    setCanScrollCategoriesForward(scrollLeft < maxScrollLeft - 4);
  }, []);

  React.useEffect(() => {
    syncCategoryScrollButtons();

    const container = categoriesTrackRef.current;

    if (!container) {
      return undefined;
    }

    const handleScroll = () => {
      syncCategoryScrollButtons();
    };

    const handleResize = () => {
      syncCategoryScrollButtons();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [syncCategoryScrollButtons]);

  const handleCategoryTrackScroll = React.useCallback((direction: 'backward' | 'forward') => {
    const container = categoriesTrackRef.current;

    if (!container) {
      return;
    }

    const offset = Math.max(220, Math.round(container.clientWidth * 0.8));

    container.scrollBy({
      left: direction === 'backward' ? -offset : offset,
      behavior: 'smooth',
    });
  }, []);

  const handleCardClick = React.useCallback(
    (eventItem: TEventItem) => {
      push(ERoutePath.event, { dynamicParams: { eventId: eventItem.id } });
    },
    [push]
  );

  const handleCardKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>, eventItem: TEventItem) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleCardClick(eventItem);
      }
    },
    [handleCardClick]
  );

  return (
    <Page
      shouldSendPageStat
      className={s.root}
      contentClassName={s.content}
      title="События"
      stickyHeader={
        <div className={s.header}>
          <div className={s.header__dates}>
            <IconButton
              mode="secondary"
              appearance="themed"
              size="medium"
              className={s.header__nav}
              disabled={!canScrollDatesBackward}
              aria-label="Прокрутить даты влево"
              onClick={() => handleDateTrackScroll('backward')}
            >
              <Icon type={EIconType.arrowLeft} size={20} />
            </IconButton>

            <div ref={datesTrackRef} className={s.header__datesTrack}>
              {dateSegments.map((segment) => (
                <section key={segment.key} className={s.dateGroup}>
                  <Typography tag="label" size="large" color="secondary" className={s.dateGroup__month}>
                    {segment.monthLabel}
                  </Typography>
                  <div className={s.dateGroup__days}>
                    {segment.days.map((item) => {
                      const isActive = item.key === selectedDate;

                      return (
                        <button
                          key={item.key}
                          type="button"
                          className={`${s.dateItem} ${isActive ? s.dateItem_active : ''}`}
                          onClick={() => handleDateSelect(item.key)}
                        >
                          <span className={s.dateItem__day}>{item.date.getDate()}</span>
                          <span className={s.dateItem__weekday}>
                            {item.date.toLocaleDateString('ru-RU', { weekday: 'short' })}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            <IconButton
              mode="secondary"
              appearance="themed"
              size="medium"
              className={s.header__nav}
              disabled={!canScrollDatesForward}
              aria-label="Прокрутить даты вправо"
              onClick={() => handleDateTrackScroll('forward')}
            >
              <Icon type={EIconType.arrowRight} size={20} />
            </IconButton>
          </div>

          <div className={s.header__searchRow}>
            <SearchInput placeholder="Найти событие" value={query} onChange={handleSearchChange} className={s.header__search} />
            {selectedDate ? (
              <Button type="button" mode="tertiary" size="small" onClick={handleDateReset} className={s.header__resetDate}>
                Сбросить дату
              </Button>
            ) : null}
          </div>

          <div className={s.header__categoriesRow}>
            <IconButton
              mode="secondary"
              appearance="themed"
              size="medium"
              className={s.header__categoriesNav}
              disabled={!canScrollCategoriesBackward}
              aria-label="Прокрутить категории влево"
              onClick={() => handleCategoryTrackScroll('backward')}
            >
              <Icon type={EIconType.arrowLeft} size={20} />
            </IconButton>

            <div ref={categoriesTrackRef} className={s.header__categories}>
              {orderedCategoryOptions.map((categoryKey) => {
                const isActive =
                  categoryKey === 'all' ? selectedCategories.length === 0 : selectedCategories.includes(categoryKey);

                return (
                  <button
                    key={categoryKey}
                    type="button"
                    className={`${s.categoryChip} ${isActive ? s.categoryChip_active : ''}`}
                    aria-pressed={isActive}
                    onClick={() => handleCategorySelect(categoryKey)}
                  >
                    {categoryKey === 'all' ? 'Все' : CATEGORY_LABELS[categoryKey]}
                  </button>
                );
              })}
            </div>

            <IconButton
              mode="secondary"
              appearance="themed"
              size="medium"
              className={s.header__categoriesNav}
              disabled={!canScrollCategoriesForward}
              aria-label="Прокрутить категории вправо"
              onClick={() => handleCategoryTrackScroll('forward')}
            >
              <Icon type={EIconType.arrowRight} size={20} />
            </IconButton>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <ScreenSpinner />
      ) : error ? (
        <div className={s.empty}>
          <Typography tag="headline" size="small" weight="strong">
            Не удалось загрузить события
          </Typography>
          <Typography tag="title" size="small" color="secondary" className={s.empty__text}>
            {error}
          </Typography>
          <Button type="button" mode="secondary" onClick={() => void loadEvents(selectedDate || undefined)}>
            Повторить
          </Button>
        </div>
      ) : (
        <motion.div
          className={s.list}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {visibleEvents.length === 0 ? (
            <div className={s.empty}>
              <Typography tag="headline" size="small" weight="strong">
                Ничего не найдено
              </Typography>
              <Typography tag="title" size="small" color="secondary" className={s.empty__text}>
                Попробуйте изменить запрос или очистить поиск.
              </Typography>
            </div>
          ) : (
            visibleEvents.map((eventItem) => (
              <motion.article
                key={eventItem.id}
                className={s.card}
                style={{ backgroundImage: `url(${eventItem.imageUrl})` }}
                role="button"
                tabIndex={0}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.2 }}
                onClick={() => handleCardClick(eventItem)}
                onKeyDown={(event) => handleCardKeyDown(event, eventItem)}
              >
                <div className={s.card__surface}>
                  <span className={s.card__tag}>{eventItem.category}</span>
                  <div className={s.card__header}>
                    <Typography tag="headline" size="small" weight="strong" className={s.card__title}>
                      {eventItem.title}
                    </Typography>
                    <Typography tag="title" size="medium" color="secondary" className={s.card__location}>
                      {eventItem.location}
                    </Typography>
                  </div>
                  <Typography tag="title" size="small" className={s.card__description}>
                    {eventItem.description}
                  </Typography>
                  <div className={s.card__meta}>
                    <Typography tag="label" size="large" weight="medium" className={s.card__metaDate}>
                      {eventItem.date}
                    </Typography>
                    {eventItem.time ? (
                      <Typography tag="label" size="large" color="secondary" className={s.card__metaTime}>
                        {eventItem.time}
                      </Typography>
                    ) : null}
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </motion.div>
      )}
    </Page>
  );
};

export default React.memo(ParserPage);
