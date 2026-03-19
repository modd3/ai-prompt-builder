import React, { useEffect, useState } from 'react';
import { Button } from './button';

const STORAGE_KEY = 'theme-preference';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored ? stored === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', dark);
    setIsDark(dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  };

  return (
    <Button type="button" variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
    </Button>
  );
};
