"use client";

import dayjs from "dayjs";
import { Button } from "flowbite-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

export default function CardMyRequest({
  title,
  plate,
  description,
  requestDate,
  requestTime,
  returnTime,
  status,
  image,
  isIdle = true,
  buttonStatus,
  rejectionReason,
}: {
  title: string;
  plate: string;
  description?: string | null;
  requestDate: Date | null;
  requestTime: string;
  returnTime: string;
  status: string;
  image: string;
  isIdle?: boolean;
  checkOutAt?: Date | null;
  buttonStatus?: string | null;
  rejectionReason?: string | null;
}) {
  const { locale } = useLanguage();
  const t = translations[locale].components.cardMyRequest;

  const getInfoStatus = (idle: boolean, st: string) => {
    if (st === "APPROVED" && !idle) return t.statusWaiting;
    const key = st?.toUpperCase();
    if (key === "PENDING") return t.statusPending;
    if (key === "APPROVED") return t.statusApproved;
    if (key === "WAITING") return t.statusWaiting;
    if (key === "COMPLETED") return t.statusCompleted;
    if (key === "CANCELLED") return t.statusCancelled;
    return "";
  };

  const generateButtonCheckout = () => {
    if (buttonStatus === "warning") {
      return (
        <>
          <span className="text-sm text-gray-500">{t.overDay}</span>
          <Button pill className="px-5 bg-red-500 text-white">
            {t.checkOut}
          </Button>
        </>
      );
    }
    if (buttonStatus === "overTime") {
      return (
        <>
          <span className="text-sm text-gray-500">{t.overTime}</span>
          <Button pill className="px-5 bg-yellow-500 text-white">
            {t.checkOut}
          </Button>
        </>
      );
    }
    if (buttonStatus === "onTime") {
      return (
        <Button pill className="px-5 bg-green-500 text-white">
          {t.checkOut}
        </Button>
      );
    }
  };

  return (
    <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 bg-gray-100 rounded-lg p-4">
      <div className="w-full md:w-1/2">
        <div className="flex flex-col w-full">
          <div className="p-1 border-b-2 border-gray-300 flex flex-col sm:flex-row sm:">
            <div className="mb-2 sm:mb-0">
              <h1 className="text-sm font-bold">{t.vehicleName}</h1>
              <span className="text-sm text-gray-500 break-words">{title}</span>
            </div>
            <div className="sm:ml-4 sm:max-w-2xl">
              <h1 className="text-sm font-bold">{t.plateNumber}</h1>
              <span className="text-sm text-gray-500">{plate}</span>
            </div>
          </div>

          {description?.trim() && (
            <div className="p-1 border-b-2 border-gray-300">
              <h1 className="text-sm font-bold">{t.description}</h1>
              <span className="text-sm text-gray-500 whitespace-pre-wrap">{description}</span>
            </div>
          )}

          <div className="p-1 border-b-2 border-gray-300">
            <h1 className="text-sm font-bold">{t.requestDate}</h1>
            <span className="text-sm text-gray-500">{dayjs(requestDate).format("DD-MM-YYYY")}</span>
          </div>

          <div className="p-1 border-b-2 border-gray-300 flex flex-col sm:flex-row sm:">
            <div className="mb-2 sm:mb-0">
              <h1 className="text-sm font-bold">{t.usageTime}</h1>
              <span className="text-sm text-gray-500">{requestTime}</span>
            </div>
            <div className="sm:ml-4 sm:max-w-2xl">
              <h1 className="text-sm font-bold">{t.returnTime}</h1>
              <span className="text-sm text-gray-500">{returnTime}</span>
            </div>
          </div>

          <div className="p-1 pb-3 border-b-2 border-gray-300">
            <h1 className="text-sm font-bold mb-2">{t.status}</h1>
            <div className="flex flex-wrap gap-2">
              {status === "PENDING" && (
                <span className="inline-block rounded-2xl bg-yellow-400 px-5 py-2 text-xs font-semibold text-white">
                  {status}
                </span>
              )}
              {status === "REJECTED" && (
                <>
                  <span className="inline-block rounded-2xl bg-red-400 px-5 py-2 text-xs font-semibold text-white">
                    {status}
                  </span>
                  <span className="inline-block px-5 py-2 text-xs font-semibold text-black ">
                    {rejectionReason}
                  </span>
                </>
              )}
              {status === "APPROVED" && (
                <>
                  <span className="inline-block rounded-2xl bg-green-400 px-5 py-2 text-xs font-semibold text-white">
                    {status}
                  </span>
                  {!isIdle && (
                    <span className="inline-block rounded-2xl bg-red-500 px-5 py-2 text-xs font-semibold text-white">
                      {t.vehicleNotReturned}
                    </span>
                  )}
                </>
              )}
              {status === "COMPLETED" && (
                <span className="inline-block rounded-2xl bg-gray-400 px-5 py-2 text-xs font-semibold text-white">
                  {status}
                </span>
              )}
              {status === "CANCELLED" && (
                <span className="inline-block rounded-2xl bg-gray-400 px-5 py-2 text-xs font-semibold text-white">
                  {status}
                </span>
              )}
            </div>
          </div>

          <div className="p-1 border-gray-300">
            <span className="text-sm text-black font-bold break-words">
              {getInfoStatus(isIdle, status)}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center">
        <div className="w-full h-full">
          <Image
            src={image}
            alt={title}
            width={500}
            height={500}
            className="rounded-lg w-full h-full object-cover"
            priority
          />
        </div>

        <div className="flex flex-col gap-2 mt-4 w-full">
          {generateButtonCheckout()}
        </div>
      </div>
    </div>
  );
}
