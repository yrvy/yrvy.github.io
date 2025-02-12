import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes } from '../themes';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'green';
  });

  const [cssTransition, setCssTransition] = useState({});

  useEffect(() => {
    // Save theme preference
    localStorage.setItem('theme', currentTheme);
    
    // Apply smooth transition
    setCssTransition({
      transition: 'background-color 0.3s ease, color 0.3s ease',
    });

    // Update CSS variables
    const root = document.documentElement;
    Object.entries(themes[currentTheme]).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, [currentTheme]);

  const toggleTheme = (themeName) => {
    setCurrentTheme(themeName);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, toggleTheme, themes }}>
      <div style={cssTransition}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}; 