import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const COLORS = {
  blue: { primary: 'hsl(210, 55%, 55%)', secondary: 'hsl(210, 55%, 45%)' },
  orange: { primary: 'hsl(34, 85%, 55%)', secondary: 'hsl(34, 85%, 45%)' },
  green: { primary: 'hsl(142, 71%, 45%)', secondary: 'hsl(142, 71%, 35%)' },
  purple: { primary: 'hsl(270, 60%, 55%)', secondary: 'hsl(270, 60%, 45%)' },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('forttrace-theme') || 'system');
  const [accent, setAccent] = useState(() => localStorage.getItem('forttrace-accent') || 'blue');
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('forttrace-compact') === 'true');

  useEffect(() => {
    localStorage.setItem('forttrace-theme', theme);
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
      
      const listener = (e) => root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('forttrace-accent', accent);
    const root = document.documentElement;
    if (COLORS[accent]) {
      root.style.setProperty('--c-primary', COLORS[accent].primary);
      root.style.setProperty('--c-secondary', COLORS[accent].secondary);
    }
  }, [accent]);
  
  useEffect(() => {
    localStorage.setItem('forttrace-compact', compactMode.toString());
    const root = document.documentElement;
    if (compactMode) {
      root.setAttribute('data-compact', 'true');
    } else {
      root.removeAttribute('data-compact');
    }
  }, [compactMode]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent, compactMode, setCompactMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
