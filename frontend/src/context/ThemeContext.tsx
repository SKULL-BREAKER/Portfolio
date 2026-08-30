import React, { createContext, useEffect, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ThemeSettings {
  bgPrimary?: string;
  bgSecondary?: string;
  primaryColor?: string;
  textPrimary?: string;
  mazeColor?: string;
}

interface ThemeContextType {
  theme: ThemeSettings | null;
  updateTheme: (newTheme: ThemeSettings) => void;
  fetchThemeByUsername: (username: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: null,
  updateTheme: () => {},
  fetchThemeByUsername: async () => {}
});

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);

  const fetchThemeByUsername = async (username: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('theme_settings').eq('username', username).maybeSingle();
      if (data && data.theme_settings) {
        const settings = typeof data.theme_settings === 'string' 
          ? JSON.parse(data.theme_settings) 
          : data.theme_settings;
        setTheme(settings);
        applyTheme(settings);
      }
    } catch (err) {
      console.error('Failed to load theme settings:', err);
    }
  };

  const applyTheme = (settings: ThemeSettings) => {
    const root = document.documentElement;
    if (settings.bgPrimary) root.style.setProperty('--bg-primary', settings.bgPrimary);
    if (settings.bgSecondary) root.style.setProperty('--bg-secondary', settings.bgSecondary);
    if (settings.primaryColor) root.style.setProperty('--primary-color', settings.primaryColor);
    if (settings.textPrimary) root.style.setProperty('--text-primary', settings.textPrimary);
    if (settings.mazeColor) root.style.setProperty('--maze-color', settings.mazeColor);
  };

  const updateTheme = (newTheme: ThemeSettings) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, fetchThemeByUsername }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
