"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
}

export default function EmptyState({
  title,
  description,
  icon = "/window.svg",
}: EmptyStateProps) {
  const { locale } = useLanguage();
  const t = translations[locale].components.emptyState;
  const displayTitle = title ?? t.defaultTitle;
  const displayDescription = description ?? t.defaultDescription;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
      <div className="relative w-24 h-24 mb-4">
        <Image
          src={icon}
          alt={t.altImage}
          fill
          className="object-contain"
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{displayTitle}</h3>
      <p className="text-sm text-gray-500">{displayDescription}</p>
    </div>
  );
}
