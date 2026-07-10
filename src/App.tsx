import { MaxUI, useSystemColorScheme } from '@maxhub/max-ui';
import * as React from 'react';
import { RouterProvider } from 'react-router-dom';

import { ScreenSpinner } from 'components/common';
import { Snackbar } from 'components/special';
import { ROUTER } from 'config/router';
import { RootStoreProvider } from 'store/globals/root';

import s from './App.module.scss';

const App: React.FC = () => {
  const colorScheme = useSystemColorScheme({ listenChanges: true });

  return (
    <MaxUI className={s.root} colorScheme={colorScheme}>
      <RootStoreProvider>
        <RouterProvider
          router={ROUTER}
          fallbackElement={<ScreenSpinner />}
          future={{
            ['v7_startTransition']: true,
          }}
        />
        <Snackbar />
      </RootStoreProvider>
    </MaxUI>
  );
};

export default App;
