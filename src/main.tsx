import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { MaxWebApp } from 'types/common/max';
import fixActive from 'utils/fixActive';

import '@vkontakte/vkui/dist/vkui.css';
import '@maxhub/max-ui/dist/styles.css';
import './styles/global.scss';

import App from './App';

declare global {
  const WebApp: MaxWebApp;
}

const startApp = () => {
  fixActive();

  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  WebApp.ready();

  startApp();
}
