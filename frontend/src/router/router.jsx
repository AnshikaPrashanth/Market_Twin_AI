import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import CommandCenter from '../pages/CommandCenter';
import CustomerTwin from '../pages/CustomerTwin';
import AIOrchestration from '../pages/AIOrchestration';
import AudienceIntelligence from '../pages/AudienceIntelligence';
import MeasurementDashboard from '../pages/MeasurementDashboard';
import ChannelSimulator from '../pages/ChannelSimulator';
import Storefront from '../pages/Storefront';
import GlobalIdentityPage from '../pages/GlobalIdentityPage';
import EmailInbox from '../pages/EmailInbox';
import WhatsAppInbox from '../pages/WhatsAppInbox';
import SmsInbox from '../pages/SmsInbox';
import AiImpactCenter from '../pages/AiImpactCenter';
import ErrorBoundary from '../components/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: '/', element: <CommandCenter /> },
      { path: '/twin', element: <CustomerTwin /> },
      { path: '/orchestration', element: <AIOrchestration /> },
      { path: '/audience', element: <AudienceIntelligence /> },
      { path: '/measurement', element: <MeasurementDashboard /> },
      { path: '/simulator', element: <ChannelSimulator /> },
      { path: '/demo/email', element: <EmailInbox /> },
      { path: '/demo/whatsapp', element: <WhatsAppInbox /> },
      { path: '/demo/sms', element: <SmsInbox /> },
      { path: '/demo/impact', element: <AiImpactCenter /> },
      { path: '/global-identity', element: <GlobalIdentityPage /> },
    ]
  },
  {
    path: '/store',
    element: <Storefront />,
    errorElement: <ErrorBoundary />
  }
]);
