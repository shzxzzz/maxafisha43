import { Panel, Typography } from '@maxhub/max-ui';
import cx from 'clsx';
import { observer } from 'mobx-react';
import * as React from 'react';

import { useChangePage } from 'utils/hooks';

import { Container } from '../../Container';
import { ScreenSpinner } from '../../ScreenSpinner';

import s from './Page.module.scss';

type TProps = React.PropsWithChildren<{
  /** Заголовок страницы */
  title?: React.ReactNode;
  titleVariant?: 'small-strong' | 'medium-strong' | 'large-strong';

  /** Шапка, зафиксированная наверху страницы */
  stickyHeader?: React.ReactNode;

  /** Список кнопок в нижней части страницы */
  footer?: React.ReactNode;

  /** Контент страницы загружается */
  isLoading?: boolean;

  /** Страница некликабельна */
  isDisabled?: boolean;

  /** Нужно ли отправлять событие о переходе на страницу */
  shouldSendPageStat?: boolean;

  /** Дополнительный класс для корневого элемента */
  className?: string;

  /** Дополнительный класс для контента */
  contentClassName?: string;
}>;

const Page: React.FC<TProps> = ({
  title,
  footer,
  stickyHeader,
  children,
  isLoading = false,
  isDisabled = false,
  shouldSendPageStat = true,
  titleVariant = 'small-strong',
  className,
  contentClassName,
}) => {
  useChangePage(shouldSendPageStat);

  return (
    <Panel className={cx(s.root, { [s.root_disabled]: isDisabled }, className)}>
      {title && (
        <Container className={s.title}>
          <Typography.Headline variant={titleVariant}>{title}</Typography.Headline>
        </Container>
      )}
      {stickyHeader && <Container className={s.header}>{stickyHeader}</Container>}
      <div
        className={cx(
          s.content,
          {
            [s['content_without-footer']]: !footer,
            [s.content_loading]: isLoading,
          },
          contentClassName
        )}
      >
        {isLoading ? <ScreenSpinner /> : children}
      </div>
      {!isLoading && footer && <Container className={s.footer}>{footer}</Container>}
    </Panel>
  );
};

export default observer(Page);
