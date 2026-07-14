import * as React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { AppLayout, ErrorFallback } from 'components/special';
import { ParserEventPage, ParserPage } from 'pages/ParserPage';

import { ERoutePath } from './paths';

export const ROUTER = createBrowserRouter([
  {
    path: ERoutePath.root,
    element: <AppLayout />,
    errorElement: <ErrorFallback />,
    children: [
      {
        index: true,
        element: <ParserPage />,
      },
      {
        path: ERoutePath.events,
        element: <ParserPage />,
      },
      {
        path: ERoutePath.event,
        element: <ParserEventPage />,
      },
    ],
  },
]);
