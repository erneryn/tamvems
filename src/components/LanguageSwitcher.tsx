'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

type Variant = 'compact' | 'buttons';

export default function LanguageSwitcher({ variant = 'compact' }: { variant?: Variant }) {
  const { locale, setLocale } = useLanguage();
  const t = translations[locale].common;

  if (variant === 'buttons') {
    return (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setLocale('id')}
          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            locale === 'id'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t.indonesian}
        </button>
        <button
          type="button"
          onClick={() => setLocale('en')}
          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            locale === 'en'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t.english}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5">
      <button
        type="button"
        onClick={() => setLocale('id')}
        className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
          locale === 'id' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
        }`}
        title="Indonesia"
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
          locale === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
