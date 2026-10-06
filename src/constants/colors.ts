export const Palette = {
  primary: '#1A7F5A',
  primaryMuted: '#3E9B75',
  primarySoft: '#E4F4ED',
  cream: '#F7F1E8',
  creamDark: '#1C1915',
  offWhite: '#FBF8F3',
  warmGray: '#8A8378',
  charcoal: '#2C2925',
  danger: '#C0453C',
  gold: '#C9A227',
} as const;

export const Colors = {
  light: {
    text: Palette.charcoal,
    textSecondary: '#6F6A62',
    textMuted: Palette.warmGray,
    background: Palette.offWhite,
    surface: '#FFFFFF',
    surfaceMuted: Palette.cream,
    border: '#E7E0D6',
    primary: Palette.primary,
    primarySoft: Palette.primarySoft,
    danger: Palette.danger,
    overlay: 'rgba(44, 41, 37, 0.45)',
    cardShadow: '#2C29251A',
    todayTint: '#FFF5D6',
    tabBar: '#FFFFFF',
    icon: '#6F6A62',
    iconActive: Palette.primary,
  },
  dark: {
    text: '#F4EEE6',
    textSecondary: '#C3BDB3',
    textMuted: '#9B948A',
    background: '#141210',
    surface: '#1E1B18',
    surfaceMuted: '#26221E',
    border: '#3A3530',
    primary: '#4CB88A',
    primarySoft: '#1A3329',
    danger: '#E06A62',
    overlay: 'rgba(0, 0, 0, 0.55)',
    cardShadow: '#00000066',
    todayTint: '#3A3218',
    tabBar: '#1A1815',
    icon: '#9B948A',
    iconActive: '#4CB88A',
  },
} as const;

export type ThemeName = 'light' | 'dark';
export type ThemeColors = (typeof Colors)[ThemeName];
export type ThemePreference = 'system' | 'light' | 'dark';
