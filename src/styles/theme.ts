export const colors = {
  // Primary - Deep Green (matching web)
  primary: '#1a472a',
  primaryLight: '#66bb6a',
  primaryDark: '#0a3618',
  primary50: '#e8f5e9',
  primary100: '#c8e6c9',
  primary200: '#a5d6a7',
  primary300: '#81c784',
  primary400: '#66bb6a',
  primary500: '#1a472a',
  primary600: '#165a30',
  primary700: '#0d4620',
  primary800: '#0a3618',
  primary900: '#052810',

  // Secondary - Gold/Amber accents (matching web)
  secondary: '#d4a835',
  secondaryLight: '#ffe082',
  secondaryDark: '#a67c00',
  secondary50: '#fff8e1',
  secondary100: '#ffecb3',
  secondary200: '#ffe082',
  secondary300: '#ffd54f',
  secondary400: '#ffca28',
  secondary500: '#d4a835',
  secondary600: '#c49000',
  secondary700: '#a67c00',
  secondary800: '#8a6800',
  secondary900: '#5c4600',

  // Neutral/Gray (matching web)
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // Semantic colors (matching web)
  success: '#10b981',
  successLight: '#d1fae5',
  successDark: '#059669',

  warning: '#f59e0b',
  warningLight: '#fef3c7',
  warningDark: '#d97706',

  error: '#ef4444',
  errorLight: '#fee2e2',
  errorDark: '#dc2626',

  info: '#3b82f6',
  infoLight: '#dbeafe',
  infoDark: '#2563eb',

  // Background & Surface (matching web)
  background: '#ffffff',
  backgroundSecondary: '#f9fafb',
  backgroundTertiary: '#f3f4f6',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Text colors (matching web)
  text: '#111827',
  textSecondary: '#4b5563',
  textTertiary: '#9ca3af',
  textInverse: '#ffffff',
  textLink: '#1a472a',
  textLinkHover: '#165a30',

  // Border (matching web)
  border: '#d1d5db',
  borderLight: '#e5e7eb',
  borderDark: '#9ca3af',
  borderFocus: '#1a472a',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '500' as const,
    lineHeight: 28,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 14,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
  },
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4.0,
    elevation: 5,
  },
};
