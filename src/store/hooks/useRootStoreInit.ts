import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useRootStore } from 'store/globals/root';

export const useRootStoreInit = () => {
  const { init, appState } = useRootStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!appState.initial) {
      return;
    }

    const initData = WebApp.initData || '';

    void init({
      navigate,
      initData,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState.initial]);

  return { appState };
};
