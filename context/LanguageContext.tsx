'use client';

import React, { createContext, useContext } from 'react';
import { useApp } from './AppContext';
import { CountryCode, Language } from '@/types';

interface LanguageContextType {
  locale: Language;
  language: Language;
  country: CountryCode;
  setLocale: (lang: Language) => void;
  setLanguage: (lang: Language) => void;
  setCountry: (code: CountryCode) => void;
  getLink: (path: string) => string;
  isRtl: boolean;
  t: (keyAr: string, keyEn: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, country, setLanguage, setCountry, isRtl, t } = useApp();

  const getLink = (path: string): string => {
    // Return appropriate canonical path based on country and language
    const cleanPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
    if (language === 'ar') {
      if (country === 'SA') return cleanPath || '/';
      return `/${country.toLowerCase()}${cleanPath}`;
    } else {
      if (country === 'SA') return `/en${cleanPath}`;
      return `/${country.toLowerCase()}-en${cleanPath}`;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        locale: language,
        language,
        country,
        setLocale: setLanguage,
        setLanguage,
        setCountry,
        getLink,
        isRtl,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // If used outside LanguageProvider, fallback gracefully using default or window
    return {
      locale: 'ar' as Language,
      language: 'ar' as Language,
      country: 'SA' as CountryCode,
      setLocale: () => {},
      setLanguage: () => {},
      setCountry: () => {},
      getLink: (p: string) => p || '/',
      isRtl: true,
      t: (ar: string) => ar,
    };
  }
  return context;
};
