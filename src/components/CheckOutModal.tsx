"use client";

import { Button } from "flowbite-react";
import { HiX, HiTruck, HiUser, HiLocationMarker, HiClock } from "react-icons/hi";
import { VehicleRequest, User, Vehicle } from "@prisma/client";
import dayjs from "dayjs";
import { useState } from "react";
import Image from "next/image";

interface RequestData extends VehicleRequest {
  user: User;
  vehicle: Vehicle;
}

interface CheckOutModalProps {
  handleCancel: () => void;
  handleCheckOut: () => void;
  selectedRequest: RequestData;
}

export default function CheckOutModal({
  handleCancel,
  handleCheckOut,
  selectedRequest,
}: CheckOutModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmCheckOut = async () => {
    setIsLoading(true);
    try {
      await handleCheckOut();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black opacity-50" onClick={handleCancel}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <HiTruck className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Konfirmasi Kembalikan Kendaraan
            </h3>
          </div>
          <Button
            color="gray"
            size="sm"
            pill
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <HiX className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-base text-gray-600 mb-4">
              Apakah Anda yakin ingin kembalikan kendaraan ini?
            </p>
            <p className="text-sm text-gray-500">
              Tindakan ini akan menandai bahwa kendaraan sudah dikembalikan.
            </p>
          </div>

          {/* Vehicle and Request Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            {/* Vehicle Info */}
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                {selectedRequest.vehicle.image ? (
                  <Image
                    src={selectedRequest.vehicle.image}
                    alt={selectedRequest.vehicle.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <HiTruck className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {selectedRequest.vehicle.name}
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedRequest.vehicle.plate}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedRequest.vehicle.type} • {selectedRequest.vehicle.year}
                </p>
                {selectedRequest.vehicle.description?.trim() && (
                  <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                    {selectedRequest.vehicle.description}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <HiUser className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedRequest.user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {selectedRequest.user.employeeId}
                  </p>
                  <p className="text-xs text-gray-500">
                    No. HP: {selectedRequest.user.phone}
                  </p>
                </div>
              </div>

              {/* Destination */}
              <div className="flex items-center space-x-3">
                <HiLocationMarker className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-900">
                    {selectedRequest.destination}
                  </p>
                </div>
              </div>

              {/* Time Schedule */}
              <div className="flex items-center space-x-3">
                <HiClock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-900">
                    {dayjs(selectedRequest.startDateTime).format('DD/MM/YYYY HH:mm')} - {dayjs(selectedRequest.endDateTime).format('DD/MM/YYYY HH:mm')}
                  </p>
                  <p className="text-xs text-gray-500">
                    Durasi: {dayjs(selectedRequest.endDateTime).diff(selectedRequest.startDateTime, 'hours')} jam
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <HiClock className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Perhatian
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Pastikan kendaraan dalam kondisi baik dan sudah benar kembali.
                    Peringatkan peminjam untuk mengembalikan kendaraan pada waktu yang telah ditentukan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex space-x-3 p-6 border-t bg-gray-50 rounded-b-lg">
          <Button
            color="alternative"
            onClick={handleCancel}
            className="flex-1"
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            color="red"
            onClick={handleConfirmCheckOut}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              'Kembalikan'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
