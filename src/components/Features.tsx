"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

export default function Features() {
  const { locale } = useLanguage();
  const t = translations[locale].features;

  const features = [
    { title: t.vehicleRecording, description: t.vehicleRecordingDesc, icon: "⚡" },
    { title: t.checkAvailability, description: t.checkAvailabilityDesc, icon: "🎨" },
    { title: t.vehicleRequest, description: t.vehicleRequestDesc, icon: "🔧" },
    { title: t.usageReport, description: t.usageReportDesc, icon: "🏗️" },
  ];

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
