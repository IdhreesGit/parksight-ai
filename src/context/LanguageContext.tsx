import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SUPPORTED_LANGUAGES, Language } from '../data/languages';
import { translations } from '../data/translations';

interface LanguageContextType {
  currentLanguage: string;
  language: Language;
  setLanguage: (code: string) => void;
  t: (key: string, fallback?: string) => string;
  languages: Language[];
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
const STORAGE_KEY = 'parksight_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const activeLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, currentLanguage);
    } catch {
      // ignore
    }
    document.documentElement.lang = activeLanguage.code;
    document.documentElement.dir = activeLanguage.dir;
  }, [currentLanguage, activeLanguage]);

  const setLanguage = useCallback((code: string) => {
    if (SUPPORTED_LANGUAGES.some((l) => l.code === code)) {
      setCurrentLanguageState(code);
    }
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const langDict = translations[currentLanguage];
      if (langDict && langDict[key]) {
        return langDict[key];
      }
      const enDict = translations.en;
      if (enDict && enDict[key]) {
        return enDict[key];
      }
      return fallback || key;
    },
    [currentLanguage]
  );

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        language: activeLanguage,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
        isRTL: activeLanguage.dir === 'rtl',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
