'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

export default function Contact() {
  const { locale } = useLanguage();
  const t = translations[locale].contact;

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600">
            {t.subtitle}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                {t.name}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t.namePlaceholder}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.email}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t.emailPlaceholder}
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                {t.subject}
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t.subjectPlaceholder}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                {t.message}
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t.messagePlaceholder}
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {t.sendMessage}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
