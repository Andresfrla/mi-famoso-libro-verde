// =====================================================
// Language Context for managing app language
// =====================================================

import React, { createContext, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Language } from '../types';
import { changeLanguage, getCurrentLanguage, SUPPORTED_LANGUAGES } from '../i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  toggleLanguage: () => Promise<void>;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  getLocalizedField: (
    item: Record<string, unknown>,
    fieldPrefix: string
  ) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  const language = (i18n.language as Language) || 'en';

  const setLanguage = useCallback(async (lang: Language) => {
    await changeLanguage(lang);
  }, []);

  const toggleLanguage = useCallback(async () => {
    const newLang = language === 'es' ? 'en' : 'es';
    await setLanguage(newLang);
  }, [language, setLanguage]);

  // Helper function to get localized field from a record
  // e.g., getLocalizedField(recipe, 'title') returns title_es or title_en
  const getLocalizedField = useCallback(
    (item: Record<string, unknown>, fieldPrefix: string): string => {
      const primaryField = `${fieldPrefix}_${language}`;
      const fallbackField = `${fieldPrefix}_${language === 'es' ? 'en' : 'es'}`;

      const primaryValue = item[primaryField];
      const fallbackValue = item[fallbackField];

      if (typeof primaryValue === 'string' && primaryValue.trim()) {
        return primaryValue;
      }
      if (typeof fallbackValue === 'string' && fallbackValue.trim()) {
        return fallbackValue;
      }
      return '';
    },
    [language]
  );

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    getLocalizedField,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
