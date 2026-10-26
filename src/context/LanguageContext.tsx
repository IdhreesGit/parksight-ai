import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { SUPPORTED_LANGUAGES, type Language } from '../data/languages';
import { translations } from '../data/translations';

interface LanguageContextValue {
  currentLanguage: string;
  language: Language;
  languages: Language[];
  setLanguage: (code: string) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const language = SUPPORTED_LANGUAGES.find((item) => item.code === currentLanguage) ?? SUPPORTED_LANGUAGES[0];

  const setLanguage = useCallback((code: string) => {
    const supported = SUPPORTED_LANGUAGES.find((item) => item.code === code);
    if (supported) {
      setCurrentLanguage(supported.code);
      document.documentElement.lang = supported.code;
      document.documentElement.dir = supported.dir;
    }
  }, []);

  const t = useCallback((key: string, fallback?: string) => {
    const activeDictionary = translations[currentLanguage] ?? translations.en ?? {};
    const englishDictionary = translations.en ?? {};
    return activeDictionary[key] ?? englishDictionary[key] ?? fallback ?? key;
  }, [currentLanguage]);

  const value = useMemo(() => ({
    currentLanguage,
    language,
    languages: SUPPORTED_LANGUAGES,
    setLanguage,
    t,
  }), [currentLanguage, language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
