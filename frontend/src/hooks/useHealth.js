import { useState, useEffect } from 'react';
import { getHealth } from '../api/healthApi';

/**
 * Custom hook providing simple health indicators.
 */
export const useHealth = () => {
  const [healthy, setHealthy] = useState(null);
  
  useEffect(() => {
    const check = async () => {
      try {
        const res = await getHealth();
        setHealthy(res.status === 'healthy');
      } catch (err) {
        setHealthy(false);
      }
    };
    check();
  }, []);

  return { healthy };
};
