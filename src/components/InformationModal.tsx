"use client";

import { Modal, Button, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

interface InformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export default function InformationModal({
  isOpen,
  onClose,
  title,
  message,
}: InformationModalProps) {
  const { locale } = useLanguage();
  const t = translations[locale].components.informationModal;
  const displayTitle = title ?? t.defaultTitle;

  return (
    <Modal show={isOpen} onClose={onClose} size="md">
      <ModalHeader className="border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <HiInformationCircle className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold text-gray-900">{displayTitle}</span>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="flex items-center space-x-3">
          <HiInformationCircle className="h-8 w-8 text-blue-500 flex-shrink-0" />
          <p className="text-gray-700 text-base leading-relaxed">{message}</p>
        </div>
      </ModalBody>
      <ModalFooter className="border-t border-gray-200">
        <Button 
          onClick={onClose}
          className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
        >
          {t.okButton}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
