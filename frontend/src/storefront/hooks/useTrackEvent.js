import { useCallback } from 'react';
import apiClient from '../../api/client';

// Helper to generate a simple unique/random string
const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Helper to get or create a persistent device ID
const getDeviceId = () => {
  let deviceId = localStorage.getItem('mt_device_id');
  if (!deviceId) {
    deviceId = `DEV_${generateRandomId()}`;
    localStorage.setItem('mt_device_id', deviceId);
  }
  return deviceId;
};

export const useTrackEvent = () => {
  const trackEvent = useCallback(async (eventType, properties = {}) => {
    const deviceId = getDeviceId();
    const email = localStorage.getItem('mt_user_email');
    const loyaltyId = localStorage.getItem('mt_user_id');

    const eventPayload = {
      event_id: `EVT_${generateRandomId()}`,
      event_type: eventType,
      source: 'storefront',
      timestamp: new Date().toISOString(),
      identifiers: {
        device_id: deviceId,
        ...(email ? { email_hash: email } : {}),
        ...(loyaltyId ? { loyalty_id: loyaltyId } : {}),
      },
      properties: {
        ...properties,
        user_name: localStorage.getItem('mt_user_name') || undefined,
      },
    };

    try {
      const customerId = loyaltyId || deviceId;
      await apiClient.post(`/api/nba/${customerId}/event`, eventPayload);
      console.log(`[Storefront] Tracked Event: ${eventType}`, eventPayload);
    } catch (error) {
      console.error(`[Storefront] Error tracking event ${eventType}:`, error);
    }
  }, []);

  return { trackEvent, deviceId: getDeviceId() };
};
