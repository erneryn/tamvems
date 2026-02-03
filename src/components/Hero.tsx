"use client";
import Link from "next/link";
import { useState } from "react";
import InformationModal from "./InformationModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { locale } = useLanguage();
  const t = translations[locale].hero;

  const handleRegistrationClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div
      className="pt-40 px-0 sm:px-6 lg:px-8 rounded-b-2xl mb-10"
      style={{
        backgroundImage: `url('https://res.cloudinary.com/deyzubayn/image/upload/v1755067006/aditya-rathod--I1AgAq3PCQ-unsplash_2_isetuj.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-7xl mx-auto -mb-20 rounded-2xl z-10">
        <div className="text-center p-8 rounded-2xl relative bg-gradient-to-br from-gray-200 to-white shadow-lg">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {t.welcome} <span className="text-blue-600">TamVems</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
              {t.tagline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/login"
                className="bg-gradient-to-br from-blue-600 to-blue-400 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                {t.login}
              </Link>
              <button
                onClick={handleRegistrationClick}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                {t.requestRegistration}
              </button>
            </div>
        </div>
      </div>
      
      <InformationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t.registrationInfoTitle}
        message={t.registrationInfoMessage}
      />
    </div>
  );
}
