import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'focus' | 'zen' | 'auto';

export const useTheme = () => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('habitCal_theme_mode') as ThemeMode;
    return saved || 'dark';
  });

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    // Determine the effective mode if auto is selected
    let effectiveMode = mode;
    if (mode === 'auto') {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 11) effectiveMode = 'zen';
      else if (hour >= 11 && hour < 18) effectiveMode = 'light';
      else if (hour >= 18 && hour < 23) effectiveMode = 'dark';
      else effectiveMode = 'focus';
    }

    // Remove all theme-related classes
    body.classList.remove('theme-focus', 'theme-zen');
    html.classList.remove('dark');

    if (effectiveMode === 'focus') {
      body.classList.add('theme-focus');
    } else if (effectiveMode === 'zen') {
      body.classList.add('theme-zen');
    } else if (effectiveMode === 'dark') {
      html.classList.add('dark');
    }
    
    localStorage.setItem('habitCal_theme_mode', mode);
  }, [mode]);

  const toggleTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  return { mode, setMode, toggleTheme };
};
