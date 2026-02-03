"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
}

export default function TimePicker({
  value = "",
  onChange,
  placeholder,
  className = "",
  min = 5,
  max = 23,
}: TimePickerProps) {
  const { locale } = useLanguage();
  const t = translations[locale].components.timePicker;
  const displayPlaceholder = placeholder ?? t.placeholder;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(value);

  // Generate hour options
  const genereHours = (min: number, max: number) => {
    return Array.from({ length: max - min + 1 }, (_, i) =>
      (i + min).toString().padStart(2, "0")
    );
  };

  const formatDisplayTime = (time: string) => {
    if (!time) return displayPlaceholder;
    return time + ":00";
  };

  return (
    <div className={`relative ${className}`}>
      {/* Time Input Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 px-3 py-2 text-left bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 flex items-center justify-between"
      >
        <span className={selectedTime ? "text-gray-900" : "text-gray-500"}>
          {formatDisplayTime(selectedTime)}
        </span>
        <Clock className="w-5 h-5 text-gray-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Time Picker Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            <div className="p-4">
              <div className="text-sm font-medium text-gray-700 mb-3 text-center">
                {t.selectTime}
              </div>

              {/* Quick Time Options */}
              <div className="grid grid-cols-2 gap-2 mb-4 z-20">
                {genereHours(min, max).map(
                  (time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setSelectedTime(time);
                        onChange?.(time);
                        setIsOpen(false);
                      }}
                      className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors"
                    >
                      {time}:00
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
