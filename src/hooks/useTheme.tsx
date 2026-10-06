import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Appearance, useColorScheme as useSystemColorScheme } from 'react-native';

import { Colors, type ThemeColors, type ThemeName, type ThemePreference } from '@/constants/colors';
import { DEFAULT_SETTINGS, getSettings, saveSettings, type AppSettings } from '@/lib/settings';

type ThemeContextValue = {
  colors: ThemeColors;
  scheme: ThemeName;
  settings: AppSettings;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
  setDefaultReminder: (hour: number, minute: number) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch((error) => {
        console.warn('[DearDay] Settings load failed', error);
      });
  }, []);

  const scheme: ThemeName =
    settings.themePreference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : settings.themePreference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: Colors[scheme],
      scheme,
      settings,
      preference: settings.themePreference,
      setPreference: async (themePreference) => {
        const next = { ...settings, themePreference };
        setSettings(next);
        if (themePreference === 'system') {
          Appearance.setColorScheme('unspecified');
        } else {
          Appearance.setColorScheme(themePreference);
        }
        await saveSettings(next);
      },
      setDefaultReminder: async (hour, minute) => {
        const next = { ...settings, defaultReminderHour: hour, defaultReminderMinute: minute };
        setSettings(next);
        await saveSettings(next);
      },
    }),
    [scheme, settings],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return value;
}
