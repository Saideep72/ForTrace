import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('ForTrace-compact') === 'true');

  useEffect(() => {
    localStorage.setItem('ForTrace-theme', 'light');
    const root = document.documentElement;
    root.setAttribute('data-theme', 'light');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ForTrace-compact', compactMode.toString());
    const root = document.documentElement;
    if (compactMode) {
      root.setAttribute('data-compact', 'true');
    } else {
      root.removeAttribute('data-compact');
    }
  }, [compactMode]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, compactMode, setCompactMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
