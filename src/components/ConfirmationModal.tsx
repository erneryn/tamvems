"use client";

import { Button, TextInput } from "flowbite-react";
import { HiX, HiExternalLink } from "react-icons/hi";
import { VehicleRequest, User, Vehicle } from "@prisma/client";
import dayjs from "dayjs";
import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

interface RequestData extends VehicleRequest {
  user: User;
  vehicle: Vehicle;
}

// Check if document URL is a PDF
const isPdfDocument = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('/raw/');
};

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
  const { locale } = useLanguage();
  const t = translations[locale].components.confirmationModal;
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
        <div className={`relative bg-white rounded-lg shadow-xl w-full mx-4 flex max-h-[90vh] flex-col ${selectedRequest.documentUrl && isPdfDocument(selectedRequest.documentUrl) ? 'max-w-4xl' : 'max-w-md'}`}>
          {/* Modal Header */}
          <div className="flex shrink-0 items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {t.title}
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

          {/* Modal Body - scrollable when content is tall */}
          <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-6">
            {!isReject ? (
              <p className="text-base text-gray-500">
                {t.chooseAction}
              </p>
            ) : (
              <p className="text-base text-gray-500">
                {t.rejectionPrompt}
              </p>
            )}
            {isReject ? (
              <TextInput
                type="text"
                placeholder={t.rejectionPlaceholder}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            ) : (
              <>
                {selectedRequest && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p>
                      <strong>{t.name}:</strong> {selectedRequest.user.name}
                    </p>
                    <p>
                      <strong>{t.vehicle}:</strong> {selectedRequest.vehicle.name}
                    </p>
                    <p>
                      <strong>{t.destination}:</strong> {selectedRequest.destination}
                    </p>
                    <p>
                      <strong>{t.time}:</strong>{" "}
                      {dayjs(selectedRequest.startDateTime).format("HH:mm")} -{" "}
                      {dayjs(selectedRequest.endDateTime).format("HH:mm")}
                    </p>
                    {selectedRequest.vehicle.description?.trim() && (
                      <p>
                        <strong>{t.description}:</strong> {selectedRequest.vehicle.description}
                      </p>
                    )}
                    {selectedRequest.documentUrl && (
                      <div className="pt-2 border-t border-gray-200 mt-2">
                        <div className="flex items-center justify-between mb-2">
                          <strong>{t.documentTask}</strong>
                          <a
                            href={selectedRequest.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {t.openInNewTab}
                            <HiExternalLink className="w-4 h-4 ml-1" />
                          </a>
                        </div>
                        {isPdfDocument(selectedRequest.documentUrl) ? (
                          <div className="w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <iframe
                              src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedRequest.documentUrl)}&embedded=true`}
                              className="w-full h-[400px]"
                              title={t.documentPdfTitle}
                              frameBorder="0"
                            />
                          </div>
                        ) : (
                          <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                            <Image
                              src={selectedRequest.documentUrl}
                              alt={t.documentTask}
                              fill
                              style={{ objectFit: "contain" }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer - always visible at bottom */}
          {isReject ? (
            <div className="flex shrink-0 space-x-3 p-6 border-t">
              <Button disabled={!reason} color="red" onClick={() => handleRejectApi(reason)} className="flex-1">
                {t.reject}
              </Button>
              <Button
                color="alternative"
                onClick={() => setIsReject(false)}
                className="flex-1"
              >
                {t.back}
              </Button>
            </div>
          ) : (
            <div className="flex shrink-0 space-x-3 p-6 border-t">
              <Button color="green" onClick={handleApprove} className="flex-1">
                {t.approve}
              </Button>
              <Button
                color="red"
                onClick={handleRejectClick}
                className="flex-1"
              >
                {t.reject}
              </Button>
              <Button
                color="alternative"
                onClick={handleCancel}
                className="flex-1"
              >
                {t.back}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
