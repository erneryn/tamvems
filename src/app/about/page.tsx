'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

export default function About() {
  const { locale } = useLanguage();
  const t = translations[locale].about;

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-gray-50 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.whatsIncluded}</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• {t.item1}</li>
              <li>• {t.item2}</li>
              <li>• {t.item3}</li>
              <li>• {t.item4}</li>
              <li>• {t.item5}</li>
              <li>• {t.item6}</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.performanceTitle}</h3>
              <p className="text-gray-700">{t.performanceDesc}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.devExpTitle}</h3>
              <p className="text-gray-700">{t.devExpDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
