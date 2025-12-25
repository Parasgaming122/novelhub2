// Novel Reader - Theme Definitions

import { ThemeMode } from '../types';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryVariant: string;
  accent: string;
  border: string;
  divider: string;
  error: string;
  success: string;
  warning: string;
  cardBackground: string;
  readerBackground: string;
  readerText: string;
  focusHighlight: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceVariant: '#E9ECEF',
    text: '#1A1A2E',
    textSecondary: '#495057',
    textMuted: '#6C757D',
    primary: '#6366F1',
    primaryVariant: '#4F46E5',
    accent: '#EC4899',
    border: '#DEE2E6',
    divider: '#E9ECEF',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    cardBackground: '#FFFFFF',
    readerBackground: '#FFFFFF',
    readerText: '#1A1A2E',
    focusHighlight: 'rgba(99, 102, 241, 0.15)',
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#0F0F1A',
    surface: '#1A1A2E',
    surfaceVariant: '#252541',
    text: '#F8F9FA',
    textSecondary: '#ADB5BD',
    textMuted: '#6C757D',
    primary: '#818CF8',
    primaryVariant: '#6366F1',
    accent: '#F472B6',
    border: '#374151',
    divider: '#252541',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    cardBackground: '#1A1A2E',
    readerBackground: '#0F0F1A',
    readerText: '#E5E5E5',
    focusHighlight: 'rgba(129, 140, 248, 0.2)',
  },
};

export const sepiaTheme: Theme = {
  mode: 'sepia',
  colors: {
    background: '#F4ECD8',
    surface: '#EDE4CF',
    surfaceVariant: '#E5DBC5',
    text: '#5C4B37',
    textSecondary: '#7A6B5A',
    textMuted: '#998B7A',
    primary: '#8B7355',
    primaryVariant: '#6B5344',
    accent: '#B8860B',
    border: '#D4C4A8',
    divider: '#E5DBC5',
    error: '#CD5C5C',
    success: '#6B8E23',
    warning: '#DAA520',
    cardBackground: '#F9F3E3',
    readerBackground: '#F4ECD8',
    readerText: '#5C4B37',
    focusHighlight: 'rgba(139, 115, 85, 0.15)',
  },
};

export const themes: Record<ThemeMode, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  sepia: sepiaTheme,
};

// Typography
export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2.0,
  },
  fontFamilies: {
    system: 'System',
    serif: 'serif',
    sansSerif: 'sans-serif',
    monospace: 'monospace',
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border Radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Bookmark colors
export const bookmarkColors = {
  yellow: '#FCD34D',
  green: '#34D399',
  blue: '#60A5FA',
  red: '#F87171',
  purple: '#A78BFA',
};

// Default Settings
export const defaultReaderSettings = {
  fontSize: 18,
  lineHeight: 1.75,
  fontFamily: 'System',
  theme: 'dark' as ThemeMode,
  keepScreenOn: true,
};

export const defaultTTSSettings = {
  pitch: 1.0,
  speed: 1.0,
  selectedVoiceIdentifier: undefined,
  autoScrollEnabled: true,
  focusEnabled: true,
};
