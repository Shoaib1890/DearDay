import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_REMINDER_HOUR, DEFAULT_REMINDER_MINUTE } from '@/constants/theme';
import type { ThemePreference } from '@/constants/colors';

const SETTINGS_KEY = '@dearday/settings';

export type AppSettings = {
  themePreference: ThemePreference;
  defaultReminderHour: number;
  defaultReminderMinute: number;
};

export const DEFAULT_SETTINGS: AppSettings = {
  themePreference: 'system',
  defaultReminderHour: DEFAULT_REMINDER_HOUR,
  defaultReminderMinute: DEFAULT_REMINDER_MINUTE,
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    console.warn('[DearDay] Failed to load settings', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
