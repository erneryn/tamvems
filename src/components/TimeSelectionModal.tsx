"use client";

import { Modal, Button, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import TimePicker from "./TimePicker";
import { Datepicker } from "flowbite-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

interface TimeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
}

export default function TimeSelectionModal({
  isOpen,
  onClose,
  vehicleId,
}: TimeSelectionModalProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  const t = translations[locale].components.timeSelectionModal;
  const formattedDate = new Date().toISOString().split('T')[0];
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");

  const handleSubmit = () => {
    if (!selectedStartTime || !selectedEndTime) {
      return;
    }
    
    // Format the date for the URL
    
    // Redirect to request form with all parameters
    router.push(`/request-form?vehicleId=${vehicleId}&date=${formattedDate}&startTime=${selectedStartTime}&endTime=${selectedEndTime}`);
  };

  return (
          <Modal show={isOpen} onClose={onClose} className="z-[10]">
      <ModalHeader>{t.title}</ModalHeader>
      <ModalBody className="relative">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="tanggal"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t.dateLabel}
            </label>
            <Datepicker
              disabled={true}
              id="tanggal"
              sizing="lg"
              placeholder={t.datePlaceholder}
              value={new Date(formattedDate)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="waktu_mulai"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t.startTime}
              </label>
              <TimePicker
                placeholder={t.startPlaceholder}
                value={selectedStartTime}
                onChange={setSelectedStartTime}
              />
            </div>

            <div>
              <label
                htmlFor="waktu_selesai"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t.endTime}
              </label>
              <TimePicker
                placeholder={t.endPlaceholder}
                value={selectedEndTime}
                onChange={setSelectedEndTime}
              />
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <div className="flex justify-end gap-2 w-full">
          <Button color="gray" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedStartTime || !selectedEndTime}
          >
            {t.continue}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
