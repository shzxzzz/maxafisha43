import * as React from 'react';
import { useLocation } from 'react-router';

import { useAnalyticsStore } from 'store/hooks';

export const useChangePage = (shouldSendPageStat: boolean): void => {
  const location = useLocation();
  const { sendPage } = useAnalyticsStore();

  React.useEffect(() => {
    if (shouldSendPageStat) {
      sendPage({
        path: location.pathname,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
