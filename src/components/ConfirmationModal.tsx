"use client";

import { Button, TextInput } from "flowbite-react";
import { HiX } from "react-icons/hi";
import { VehicleRequest, User, Vehicle } from "@prisma/client";
import dayjs from "dayjs";
import { useState } from "react";

interface RequestData extends VehicleRequest {
  user: User;
  vehicle: Vehicle;
}

export default function ConfirmationModal({
  handleCancel,
  handleApprove,
  handleRejectApi,
  selectedRequest,
}: {
  handleCancel: () => void;
  handleApprove: () => void;
  handleRejectApi: (reason: string) => void;
  selectedRequest: RequestData;
}) {
  const [reason, setReason] = useState("");
  const [isReject, setIsReject] = useState(false);

  const handleRejectClick = () => {
    setIsReject(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 " onClick={handleCancel}>
          <div className="fixed inset-0 bg-black opacity-50"></div>
        </div>
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Konfirmasi Tindakan
            </h3>
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

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            {!isReject ? (
              <p className="text-base text-gray-500">
                Pilih tindakan untuk pengajuan:
              </p>
            ) : (
              <p className="text-base text-gray-500">
                Masukkan alasan penolakan:
              </p>
            )}
            {isReject ? (
              <TextInput
                type="text"
                placeholder="Masukkan alasan penolakan"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            ) : (
              <>
                {selectedRequest && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p>
                      <strong>Nama:</strong> {selectedRequest.user.name}
                    </p>
                    <p>
                      <strong>Kendaraan:</strong> {selectedRequest.vehicle.name}
                    </p>
                    <p>
                      <strong>Tujuan:</strong> {selectedRequest.destination}
                    </p>
                    <p>
                      <strong>Waktu:</strong>{" "}
                      {dayjs(selectedRequest.startDateTime).format("HH:mm")} -{" "}
                      {dayjs(selectedRequest.endDateTime).format("HH:mm")}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer */}
          {isReject ? (
            <div className="flex space-x-3 p-6 border-t">
              <Button disabled={!reason} color="red" onClick={() => handleRejectApi(reason)} className="flex-1">
                Tolak
              </Button>
              <Button
                color="alternative"
                onClick={() => setIsReject(false)}
                className="flex-1"
              >
                Kembali
              </Button>
            </div>
          ) : (
            <div className="flex space-x-3 p-6 border-t">
              <Button color="green" onClick={handleApprove} className="flex-1">
                Setujui
              </Button>
              <Button
                color="red"
                onClick={handleRejectClick}
                className="flex-1"
              >
                Tolak
              </Button>
              <Button
                color="alternative"
                onClick={handleCancel}
                className="flex-1"
              >
                Kembali
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
