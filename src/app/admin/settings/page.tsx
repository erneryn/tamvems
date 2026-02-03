'use client';

import { Card } from "flowbite-react";
import { HiCog, HiGlobe } from "react-icons/hi";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

export default function AdminSettings() {
  const { locale, setLocale } = useLanguage();
  const t = translations[locale];
  const settingsT = t.admin.settings;
  const commonT = t.common;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <HiCog className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">{settingsT.title}</h1>
      </div>

      {/* Language Switcher */}
      <Card className="w-full">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-blue-100 p-3">
            <HiGlobe className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {commonT.language}
            </h2>
            <p className="text-sm text-gray-500 mb-4">{settingsT.languageDescription}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setLocale("id")}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  locale === "id"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {commonT.indonesian}
              </button>
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  locale === "en"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {commonT.english}
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="w-full">
        <div className="text-center py-12">
          <HiCog className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {settingsT.settingsPage}
          </h2>
          <p className="text-gray-500">{settingsT.settingsDescription}</p>
        </div>
      </Card>
    </div>
  );
}
