import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const useApiStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = async () => {
    try {
      setIsLoading(true);
      const connected = await apiService.testConnection();
      setIsConnected(connected);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
      setLastChecked(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    isLoading,
    lastChecked,
    checkConnection
  };
};
