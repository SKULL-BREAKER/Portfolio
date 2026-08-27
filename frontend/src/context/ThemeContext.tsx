import React, { createContext, useEffect, useContext, useState } from 'react';
import axios from 'axios';

interface ThemeSettings {
  bgPrimary?: string;
  bgSecondary?: string;
  primaryColor?: string;
  textPrimary?: string;
}

interface ThemeContextType {
  theme: ThemeSettings | null;
  updateTheme: (newTheme: ThemeSettings) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: null,
  updateTheme: () => {}
});

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await axios.get('/api/profile');
        if (response.data.success && response.data.profile?.themeSettings) {
          const parsedTheme = JSON.parse(response.data.profile.themeSettings);
          setTheme(parsedTheme);
          applyTheme(parsedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme settings', error);
      }
    };
    fetchTheme();
  }, []);

  const applyTheme = (settings: ThemeSettings) => {
    const root = document.documentElement;
    if (settings.bgPrimary) root.style.setProperty('--bg-primary', settings.bgPrimary);
    if (settings.bgSecondary) root.style.setProperty('--bg-secondary', settings.bgSecondary);
    if (settings.primaryColor) root.style.setProperty('--primary-color', settings.primaryColor);
    if (settings.textPrimary) root.style.setProperty('--text-primary', settings.textPrimary);
  };

  const updateTheme = (newTheme: ThemeSettings) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
