import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { cn } from "@/common/lib/utils";

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  rootClassName: string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = 'app-theme';

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    const savedTheme = localStorage.getItem(THEME_KEY);
    return (savedTheme as Theme) || 'system';
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(
    typeof window === 'undefined' ? 'light' : getSystemTheme()
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setThemeWithPersist = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);

    const root = window.document.documentElement;
    if (newTheme === 'system') {
      const isSystemDark = getSystemTheme() === 'dark';
      root.classList.toggle('dark', isSystemDark);
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }

    root.classList.add('theme-transition');
    setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 300);
  };

  const toggleDarkMode = () => {
    const currentTheme = theme === 'system' ? systemTheme : theme;
    setThemeWithPersist(currentTheme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'system' ? systemTheme === 'dark' : theme === 'dark';
    root.classList.toggle('dark', isDark);
  }, [theme, systemTheme]);

  const isDarkMode = theme === 'system' ? systemTheme === 'dark' : theme === 'dark';

  const rootClassName = useMemo(
    () => cn(
      "h-screen w-screen flex flex-col overflow-hidden",
      isDarkMode ? "bg-gray-900" : "bg-gray-50"
    ),
    [isDarkMode]
  );

  const value = {
    theme,
    setTheme: setThemeWithPersist,
    isDarkMode,
    toggleDarkMode,
    rootClassName,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 