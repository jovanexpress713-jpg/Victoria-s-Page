import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'vls_theme';

function readStoredTheme(): Theme {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // التخزين غير متاح
  }
  // الداكن هو الهوية الافتراضية لـ Victoria Line Soft
  return 'dark';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;

    const meta = document.head.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#080b16' : '#f5f5f0');

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // تجاهل: لن يُحفظ التفضيل
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
