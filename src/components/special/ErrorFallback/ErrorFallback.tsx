import { Icon56ErrorOutline } from '@vkontakte/icons';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useLocation, useNavigate, useRouteError } from 'react-router';

import { Button, Page, Typography, Container } from 'components/common';
import { ERoutePath } from 'config/router';
import { EErrorType } from 'store/globals/error/types';
import { useRootStore } from 'store/globals/root';
import { useErrorStore } from 'store/hooks';

import s from './ErrorFallback.module.scss';

const ErrorFallback: React.FC = () => {
  const { error } = useErrorStore();
  const routeError = useRouteError();
  const navigate = useNavigate();
  const { reload } = useRootStore();
  const location = useLocation();

  const restart = React.useCallback(() => {
    navigate(ERoutePath.root, { replace: true });
    reload();
  }, [navigate, reload]);

  React.useEffect(() => {
    error({
      error: routeError,
      data: {
        type: EErrorType.ROUTER,
        route: location.pathname,
      },
    });
  }, [routeError, location.pathname, error]);

  return (
    <Page
      shouldSendPageStat={false}
      footer={
        <Button size="large" onClick={restart}>
          Попробовать ещё раз
        </Button>
      }
    >
      <Container className={s.root}>
        <div className={s.root__content}>
          <div className={s.root__icon}>
            <Icon56ErrorOutline />
          </div>
          <Typography tag="title" size="large" className={s.root__title}>
            Произошла ошибка!
          </Typography>
          <Typography className={s.root__description}>
            Перезагрузите приложение или попробуйте позже
          </Typography>
        </div>
      </Container>
    </Page>
  );
};

export default observer(ErrorFallback);
