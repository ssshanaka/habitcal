import { useState, useEffect } from 'react';
import { fetchWeather, WeatherData } from '../services/weather';

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = async () => {
    setLoading(true);
    try {
      const data = await fetchWeather();
      setWeather(data);
      setError(null);
    } catch (err) {
      setError('Failed to load weather');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(loadWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { weather, loading, error, refresh: loadWeather };
};
