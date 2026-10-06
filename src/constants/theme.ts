import { Platform } from 'react-native';

import { Colors, Palette } from '@/constants/colors';

export { Colors, Palette };
export type { ThemeColors, ThemeName, ThemePreference } from '@/constants/colors';

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  full: 999,
} as const;

export const RELATIONSHIP_SUGGESTIONS = [
  'Mother',
  'Father',
  'Brother',
  'Sister',
  'Friend',
  'Partner',
  'Cousin',
  'Colleague',
  'Other',
] as const;

export const REMINDER_PRESETS = [
  { label: '7:00 AM', hour: 7, minute: 0 },
  { label: '8:00 AM', hour: 8, minute: 0 },
  { label: '9:00 AM', hour: 9, minute: 0 },
  { label: '10:00 AM', hour: 10, minute: 0 },
  { label: '12:00 PM', hour: 12, minute: 0 },
] as const;

export const DEFAULT_REMINDER_HOUR = 9;
export const DEFAULT_REMINDER_MINUTE = 0;
export const MAX_NAME_LENGTH = 80;
export const MAX_NOTES_LENGTH = 500;
export const MAX_RELATIONSHIP_LENGTH = 40;
export const UPCOMING_LIMIT = 8;
