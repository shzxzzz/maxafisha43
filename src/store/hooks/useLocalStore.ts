import * as React from 'react';

import { ILocalStore } from '../interfaces';

export const useLocalStore = <S extends ILocalStore = any>(
  creator: () => S,
  effect: any[] = []
): S => {
  const store = React.useRef(creator());
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    return () => {
      store.current?.destroy();
    };
  }, []);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      return;
    }

    store.current.destroy();
    store.current = creator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, effect);

  return store.current;
};
