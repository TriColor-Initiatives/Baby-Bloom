import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('baby-bloom-theme') || 'light';
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('baby-bloom-accent') || 'blue';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('baby-bloom-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor);
    localStorage.setItem('baby-bloom-accent', accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const changeAccentColor = (color) => {
    setAccentColor(color);
  };

  const value = {
    theme,
    accentColor,
    toggleTheme,
    setTheme,
    changeAccentColor
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
