import * as React from 'react';
import { useLocation } from 'react-router';

import { ERoutePath } from 'config/router';
import { useRouterStore } from 'store/hooks';
import noop from 'utils/noop';

const BACK_BUTTON_EXCLUDE_PATHS: string[] = [ERoutePath.root, ERoutePath.error];

export const useNativeBackButton = () => {
  const location = useLocation();
  const { goBack } = useRouterStore();

  // Если потребуется добавить в исключения динамические роуты,
  // то определение текущего ERoutePath нужно будет доработать
  const path = location.pathname as ERoutePath;

  const shouldBackButtonShow = !BACK_BUTTON_EXCLUDE_PATHS.includes(path);

  const handleBack = React.useCallback(() => {
    goBack();
  }, [goBack]);

  React.useEffect(() => {
    if (!WebApp.BackButton) {
      return noop;
    }

    if (shouldBackButtonShow) {
      WebApp.BackButton.show();
      WebApp.BackButton.onClick(handleBack);
    } else {
      WebApp.BackButton.hide();
    }

    return () => {
      WebApp.BackButton.offClick(handleBack);
    };
  }, [handleBack, shouldBackButtonShow]);

  return { shouldBackButtonShow, handleBack };
};
