// =====================================================
// i18n Configuration
// =====================================================

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en.json';
import es from './es.json';
import { STORAGE_KEYS } from '../lib/constants';
import { Language } from '../types';

// Translation resources
const resources = {
  en: { translation: en },
  es: { translation: es },
};

// Language detector plugin for AsyncStorage
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // First try to get saved language preference
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }

      // Fallback to device locale
      const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
      const supportedLanguage = deviceLocale.startsWith('es') ? 'es' : 'en';
      callback(supportedLanguage);
    } catch {
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lng);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  },
};

// Initialize i18n
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Helper function to change language
export const changeLanguage = async (lng: Language): Promise<void> => {
  await i18n.changeLanguage(lng);
  await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lng);
};

// Helper function to get current language
export const getCurrentLanguage = (): Language => {
  return (i18n.language as Language) || 'en';
};

// Helper to get supported languages
export const SUPPORTED_LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
];

export default i18n;
