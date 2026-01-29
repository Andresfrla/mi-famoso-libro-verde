// =====================================================
// App Constants and Theme Configuration
// =====================================================

import { Category, Difficulty } from '../types';

// Theme Colors - Green palette inspired by the UI design
export const Colors = {
  light: {
    primary: '#22C55E', // Vibrant green
    primaryLight: '#86EFAC',
    primaryDark: '#16A34A',
    background: '#F6F8F6',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F1',
    text: '#1E293B',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    success: '#22C55E',
    warning: '#F59E0B',
    favorite: '#22C55E',
    favoriteInactive: '#94A3B8',
  },
  dark: {
    primary: '#22C55E',
    primaryLight: '#4ADE80',
    primaryDark: '#16A34A',
    background: '#102210',
    surface: '#1E3A1E',
    surfaceSecondary: '#2D4A2D',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: '#334155',
    error: '#F87171',
    errorLight: '#7F1D1D',
    success: '#4ADE80',
    warning: '#FBBF24',
    favorite: '#22C55E',
    favoriteInactive: '#64748B',
  },
};

// Spacing scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius scale
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// Font sizes
export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
};

// Font weights
export const FontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Category options with translations
export const CATEGORIES: { value: Category; labelKey: string }[] = [
  { value: 'all', labelKey: 'categories.all' },
  { value: 'breakfast', labelKey: 'categories.breakfast' },
  { value: 'lunch', labelKey: 'categories.lunch' },
  { value: 'dinner', labelKey: 'categories.dinner' },
  { value: 'dessert', labelKey: 'categories.dessert' },
  { value: 'snack', labelKey: 'categories.snack' },
];

// Difficulty options with translations
export const DIFFICULTIES: { value: Difficulty; labelKey: string }[] = [
  { value: 'easy', labelKey: 'difficulty.easy' },
  { value: 'medium', labelKey: 'difficulty.medium' },
  { value: 'hard', labelKey: 'difficulty.hard' },
];

// Storage keys
export const STORAGE_KEYS = {
  LANGUAGE: '@mi_libro_verde_language',
  AUTH_TOKEN: '@mi_libro_verde_auth_token',
  USER_PREFERENCES: '@mi_libro_verde_preferences',
};

// Default values
export const DEFAULTS = {
  PREP_TIME: 30,
  SERVINGS: 4,
  DIFFICULTY: 'medium' as Difficulty,
  CATEGORY: 'all' as Category,
};
