import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import CommandCenter from '../pages/CommandCenter';
import CustomerTwin from '../pages/CustomerTwin';
import AudienceIntelligence from '../pages/AudienceIntelligence';
import MeasurementDashboard from '../pages/MeasurementDashboard';
import ChannelSimulator from '../pages/ChannelSimulator';
import Storefront from '../pages/Storefront';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: '/', element: <CommandCenter /> },
      { path: '/twin', element: <CustomerTwin /> },
      { path: '/audience', element: <AudienceIntelligence /> },
      { path: '/measurement', element: <MeasurementDashboard /> },
      { path: '/simulator', element: <ChannelSimulator /> },
    ]
  },
  {
    path: '/store',
    element: <Storefront />
  }
]);
