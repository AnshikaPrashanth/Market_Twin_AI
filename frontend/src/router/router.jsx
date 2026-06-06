import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import DashboardPage from '../pages/DashboardPage';
import EventLabPage from '../pages/EventLabPage';
import TwinPage from '../pages/TwinPage';
import IdentityPage from '../pages/IdentityPage';
import HealthPage from '../pages/HealthPage';

import StoreLayout from '../storefront/layout/StoreLayout';
import StoreHomePage from '../storefront/pages/StoreHomePage';
import StoreProductPage from '../storefront/pages/StoreProductPage';
import StoreCartPage from '../storefront/pages/StoreCartPage';
import StoreCheckoutPage from '../storefront/pages/StoreCheckoutPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/event-lab', element: <EventLabPage /> },
      { path: '/twin', element: <TwinPage /> },
      { path: '/identity', element: <IdentityPage /> },
      { path: '/health', element: <HealthPage /> },
    ]
  },
  {
    path: '/store',
    element: <StoreLayout />,
    children: [
      { path: '', element: <StoreHomePage /> },
      { path: 'product/:id', element: <StoreProductPage /> },
      { path: 'cart', element: <StoreCartPage /> },
      { path: 'checkout', element: <StoreCheckoutPage /> },
    ]
  }
]);
