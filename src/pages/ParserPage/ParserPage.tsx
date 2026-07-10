import { motion } from 'framer-motion';
import * as React from 'react';

import { Button, Page, ScreenSpinner, SearchInput, Typography } from 'components/common';
import { ERoutePath } from 'config/router';
import { useRouterStore } from 'store/hooks';
import { useDebounce } from 'utils/hooks';

import { fetchParserEvents, TEventItem } from './data';
import s from './ParserPage.module.scss';

const ParserPage: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const [events, setEvents] = React.useState<TEventItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { push } = useRouterStore();
  const debouncedQuery = useDebounce(query, 180);

  const loadEvents = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchParserEvents();
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

  const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
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
          <SearchInput placeholder="Найти событие" value={query} onChange={handleSearchChange} className={s.header__search} />
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
          <Button type="button" mode="secondary" onClick={loadEvents}>
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
          {filteredEvents.length === 0 ? (
            <div className={s.empty}>
              <Typography tag="headline" size="small" weight="strong">
                Ничего не найдено
              </Typography>
              <Typography tag="title" size="small" color="secondary" className={s.empty__text}>
                Попробуйте изменить запрос или очистить поиск.
              </Typography>
            </div>
          ) : (
            filteredEvents.map((eventItem) => (
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
                    <Typography tag="label" size="large" color="secondary" className={s.card__metaTime}>
                      {eventItem.time}
                    </Typography>
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
