"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

interface LoadingProps {
  type?: "card" | "form" | "full";
}

export default function Loading({ type = "full" }: LoadingProps) {
  const { locale } = useLanguage();
  const t = translations[locale].common.loading;

  if (type === "card") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:mx-20">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm p-4 animate-pulse"
          >
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "form") {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm animate-pulse">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
          <div className="h-12 bg-gray-200 rounded mt-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full" />
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-gray-600 font-medium">{t}</p>
      </div>
    </div>
  );
}
