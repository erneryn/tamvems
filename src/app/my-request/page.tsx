"use client";
import { Select } from "flowbite-react";
import CardMyRequest from "@/components/CardMyRequest";
import { useEffect, useState } from "react";
import { VehicleRequest } from "@prisma/client";
import dayjs from "dayjs";
interface UserRequest extends VehicleRequest {
  isIdle?: boolean;
  buttonStatus?: string | null;
  vehicle: {
    name: string;
    plate: string;
    image: string;
  };
}

export default function PengajuanSaya() {
  const [userRequest, setUserRequest] = useState<UserRequest[]>([]);

  useEffect(() => {
    fetchUserRequest();
  }, []);

  const fetchUserRequest = async () => {
    const response = await fetch("/api/user-request");
    const data = await response.json();
    setUserRequest(data);
  };

  return (
    <div className="container mx-auto px-4 mt-6 md:mt-10">
      <h1 className="text-2xl md:text-3xl text-center font-bold uppercase">
        Pengajuan Saya
      </h1>
      <div
        className="relative w-full lg:w-3/4 mx-auto border-2 border-gray-300 rounded-lg p-4 md:p-10 my-6 md:my-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/bg-form.jpg)" }}
      >
        <div className="absolute inset-0 bg-white opacity-80 rounded-lg"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 mb-6">
            <div className="w-full sm:w-[200px]">
              <Select id="vehicleType" className="w-full">
                <option value="bensin">Terbaru</option>
                <option value="diesel">Terlama</option>
              </Select>
            </div>
            <div className="w-full sm:w-[200px]">
              <Select id="status" className="w-full">
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </Select>
            </div>
            <div className="w-full sm:w-[200px]">
              <Select id="dateRange" className="w-full">
                <option value="">Semua Waktu</option>
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="year">Tahun Ini</option>
              </Select>
            </div>
          </div>
          <div className="w-full border-2 border-gray-300 rounded-lg my-4"></div>
          <div className="flex flex-col justify-between items-center gap-4 mx-0 md:mx-4 lg:mx-20">
            {userRequest.map((request) => (
              <CardMyRequest 
              key={request.id} 
              title={request.vehicle.name}
              plate={request.vehicle.plate}
              image={request.vehicle.image || '/default-car.png'}
              requestDate={request.startDateTime}
              requestTime={dayjs(request.startDateTime).format("HH:mm")}
              returnTime={dayjs(request.endDateTime).format("HH:mm")}
              status={request.status}
              checkOutAt={request.checkOutAt}
              buttonStatus={request.buttonStatus}
              isIdle={request.isIdle}
              rejectionReason={request.rejectionReason || null}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}