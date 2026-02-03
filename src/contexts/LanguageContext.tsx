'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Locale = 'id' | 'en';

const STORAGE_KEY = 'tamvems-locale';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('id');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === 'id' || stored === 'en') {
      setLocaleState(stored);
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale === 'id' ? 'id' : 'en';
    }
  };

  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      document.documentElement.lang = locale === 'id' ? 'id' : 'en';
    }
  }, [locale, mounted]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (ctx === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
