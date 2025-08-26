"use client";

import { Modal, Button, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import TimePicker from "./TimePicker";
import { Datepicker } from "flowbite-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
      <ModalHeader>Pilih Waktu Penggunaan</ModalHeader>
      <ModalBody className="relative">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="tanggal"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tanggal Penggunaan
            </label>
            <Datepicker
              disabled={true}
              id="tanggal"
              sizing="lg"
              placeholder="Pilih tanggal"
              value={new Date(formattedDate)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="waktu_mulai"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Waktu Mulai
              </label>
              <TimePicker
                placeholder="Pilih waktu mulai"
                value={selectedStartTime}
                onChange={setSelectedStartTime}
              />
            </div>

            <div>
              <label
                htmlFor="waktu_selesai"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Waktu Selesai
              </label>
              <TimePicker
                placeholder="Pilih waktu selesai"
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
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedStartTime || !selectedEndTime}
          >
            Lanjutkan
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
