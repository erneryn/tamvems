'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

export default function Footer() {
  const { locale } = useLanguage();
  const t = translations[locale].footer;

  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">TamVems</h3>
            <p className="text-gray-400 mb-4 max-w-md">{t.tagline}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t.quickLinks}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  {t.home}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  {t.about}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">{t.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
