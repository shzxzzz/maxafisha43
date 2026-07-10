import { Icon24ArrowLeftOutline } from '@vkontakte/icons';
import * as React from 'react';
import { useParams } from 'react-router';

import { Button, Page, ScreenSpinner, Typography } from 'components/common';
import { useRouterStore } from 'store/hooks';
import { useExternalOpen } from 'utils/hooks';

import { fetchParserEvent, TEventItem } from './data';
import s from './ParserEventPage.module.scss';

const ParserEventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { goBack } = useRouterStore();
  const { open, isLoading: isOpening } = useExternalOpen();
  const [eventItem, setEventItem] = React.useState<TEventItem | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const loadEvent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchParserEvent(eventId);

        if (!isMounted) {
          return;
        }

        if (!response) {
          setEventItem(null);
          setError('Событие не найдено.');
          return;
        }

        setEventItem(response);
      } catch {
        if (!isMounted) {
          return;
        }

        setEventItem(null);
        setError('Не удалось загрузить событие.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadEvent();

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  const handleOpenAfisha = React.useCallback(() => {
    if (!eventItem) {
      return;
    }

    open(() => {
      window.open(eventItem.link, '_blank', 'noopener,noreferrer');
    });
  }, [eventItem, open]);

  if (isLoading) {
    return (
      <Page shouldSendPageStat className={s.root} title="Загрузка события">
        <ScreenSpinner />
      </Page>
    );
  }

  if (!eventItem || error) {
    return (
      <Page shouldSendPageStat className={s.root} title="Событие не найдено">
        <div className={s.empty}>
          <Typography tag="title" size="small" color="secondary">
            {error ?? 'Проверьте ссылку или вернитесь к списку событий.'}
          </Typography>
          <Button type="button" mode="secondary" onClick={goBack}>
            Вернуться назад
          </Button>
        </div>
      </Page>
    );
  }

  return (
    <Page
      shouldSendPageStat
      className={s.root}
      contentClassName={s.content}
      title={eventItem.title}
      titleVariant="large-strong"
    >
      <div className={s.back}>
        <Button type="button" mode="tertiary" size="small" iconBefore={<Icon24ArrowLeftOutline />} onClick={goBack}>
          Назад к событиям
        </Button>
      </div>

      <section className={s.hero} style={{ backgroundImage: `url(${eventItem.imageUrl})` }}>
        <div className={s.hero__surface}>
          <span className={s.hero__tag}>{eventItem.category}</span>
          <div className={s.hero__meta}>
            <Typography tag="label" size="large" weight="medium" className={s.hero__metaDate}>
              {eventItem.date}
            </Typography>
            <Typography tag="label" size="large" color="secondary" className={s.hero__metaTime}>
              {eventItem.time}
            </Typography>
          </div>
          <Typography tag="headline" size="large" weight="strong" className={s.hero__title}>
            {eventItem.title}
          </Typography>
          <Typography tag="title" size="small" color="secondary" className={s.hero__location}>
            {eventItem.location}
          </Typography>
        </div>
      </section>

      <section className={s.info}>
        <Typography tag="headline" size="small" weight="strong" className={s.info__title}>
          О событии
        </Typography>
        <Typography tag="title" size="small" className={s.info__text}>
          {eventItem.description}
        </Typography>
      </section>

      {eventItem.artistDescription ? (
        <section className={s.info}>
          <Typography tag="headline" size="small" weight="strong" className={s.info__title}>
            Об артисте
          </Typography>
          <Typography tag="title" size="small" className={s.info__text}>
            {eventItem.artistDescription}
          </Typography>
        </section>
      ) : null}

      <Button type="button" mode="secondary" stretched onClick={handleOpenAfisha} disabled={isOpening}>
        Посмотреть на афише
      </Button>
    </Page>
  );
};

export default React.memo(ParserEventPage);
