import { AnimatePresence } from 'framer-motion';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useLocation } from 'react-router';
import { useOutlet } from 'react-router-dom';

import { TNavigationDirection } from 'store/globals/router/types';
import { useRootStoreInit } from 'store/hooks';
import { getHistoryIdx } from 'utils/getHistoryIdx';
import { useNativeBackButton } from 'utils/hooks';

import * as ui from './ui';

const AppLayout: React.FC = () => {
  const { appState } = useRootStoreInit();
  const location = useLocation();
  const outlet = useOutlet();
  const { handleBack, shouldBackButtonShow } = useNativeBackButton();

  const prevIdxRef = React.useRef(getHistoryIdx());
  const currentIdx = getHistoryIdx();
  const direction: TNavigationDirection = currentIdx < prevIdxRef.current ? 'back' : 'forward';

  React.useEffect(() => {
    prevIdxRef.current = currentIdx;
  }, [currentIdx]);

  const content = () => {
    if (appState.loading || appState.initial) {
      return <ui.Loader key="loader" />;
    }

    return (
      <ui.PageWrapper key={location.key} direction={direction}>
        {outlet}
      </ui.PageWrapper>
    );
  };

  return (
    <>
      <AnimatePresence mode="popLayout" custom={direction}>
        {content()}
      </AnimatePresence>
      {shouldBackButtonShow && <ui.DevBack onClick={handleBack} />}
    </>
  );
};

export default observer(AppLayout);
