import * as React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { AppLayout, ErrorFallback } from 'components/special';
import { CategoryPage } from 'pages/CategoryPage';
import { HomePage } from 'pages/HomePage';
import { ParserEventPage, ParserPage } from 'pages/ParserPage';
import { ServicePage } from 'pages/ServicePage';

import { ERoutePath } from './paths';

export const ROUTER = createBrowserRouter([
  {
    path: ERoutePath.root,
    element: <AppLayout />,
    errorElement: <ErrorFallback />,
    children: [
      {
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: ERoutePath.categories,
            element: <CategoryPage />,
          },
          {
            path: ERoutePath.category,
            element: <CategoryPage />,
          },
          {
            path: ERoutePath.service,
            element: <ServicePage />,
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
    ],
  },
]);
