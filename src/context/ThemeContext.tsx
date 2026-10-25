import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'vls_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
      // Default to dark as per Victoria Line Soft design identity
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  const applyTheme = (currentTheme: Theme) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      // Update root scope CSS variables dynamically
      root.style.setProperty('--vls-paper', '#080b16');
      root.style.setProperty('--vls-paper-subtle', '#0d1323');
      root.style.setProperty('--vls-ink', '#f7f8ff');
      root.style.setProperty('--vls-ink-muted', '#a7b1c7');
      root.style.setProperty('--vls-panel', '#111a2d');
      root.style.setProperty('--vls-panel-card', '#131f36');
      root.style.setProperty('--vls-line', '#26324b');
      root.style.setProperty('--vls-header-bg', 'rgba(8, 11, 22, 0.88)');
      root.style.setProperty('--vls-card-bg', '#0f172a');
      root.style.setProperty('--vls-border-color', 'rgba(255, 255, 255, 0.12)');
      root.style.setProperty('--vls-body-bg', '#080b16');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      // Update root scope CSS variables dynamically for light mode
      root.style.setProperty('--vls-paper', '#f8fafc');
      root.style.setProperty('--vls-paper-subtle', '#f1f5f9');
      root.style.setProperty('--vls-ink', '#0f172a');
      root.style.setProperty('--vls-ink-muted', '#475569');
      root.style.setProperty('--vls-panel', '#ffffff');
      root.style.setProperty('--vls-panel-card', '#ffffff');
      root.style.setProperty('--vls-line', '#e2e8f0');
      root.style.setProperty('--vls-header-bg', 'rgba(248, 250, 252, 0.92)');
      root.style.setProperty('--vls-card-bg', '#ffffff');
      root.style.setProperty('--vls-border-color', '#e2e8f0');
      root.style.setProperty('--vls-body-bg', '#f8fafc');
    }
  };

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
