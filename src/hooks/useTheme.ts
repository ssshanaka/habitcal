import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'focus' | 'zen';

export const useTheme = () => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('habitCal_theme_mode') as ThemeMode;
    return saved || 'dark';
  });

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    // Remove all theme-related classes
    body.classList.remove('theme-focus', 'theme-zen');
    html.classList.remove('dark');

    if (mode === 'focus') {
      body.classList.add('theme-focus');
    } else if (mode === 'zen') {
      body.classList.add('theme-zen');
    } else if (mode === 'dark') {
      html.classList.add('dark');
    }
    
    localStorage.setItem('habitCal_theme_mode', mode);
  }, [mode]);

  const toggleTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  return { mode, setMode, toggleTheme };
};
