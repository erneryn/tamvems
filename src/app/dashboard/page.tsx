"use client";

import { Button, Datepicker } from "flowbite-react";
import TimePicker from "@/components/TimePicker";
import { useState, useEffect, useCallback } from "react";
import Card from "@/components/Card";
import CheckOut from "@/components/CheckOut";
import { VehicleResponse } from "@/app/api/request/route";
import { UserVehicleStatus } from "@/app/api/user-status/route";
import EmptyState from "@/components/EmptyState";
import Loading from "@/components/Loading";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const minHour = dayjs().get("hour");
  const [isUsingVehicle, setIsUsingVehicle] = useState(false);
  const [isOverlapping, setIsOverlapping] = useState(false);
  const [userStatus, setUserStatus] = useState<UserVehicleStatus | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(minHour.toString());
  const [selectedEndTime, setSelectedEndTime] = useState((minHour + 1).toString());
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleUseClick = (vehicleId: string) => {
    const selectedDateFormatted = dayjs(selectedDate).format("YYYY-MM-DD");
    const selectedStartTimeFormatted = selectedStartTime;
    const selectedEndTimeFormatted = selectedEndTime;
    // redirect to booking page
    router.push(
      `/request-form?vehicleId=${vehicleId}&date=${selectedDateFormatted}&startTime=${selectedStartTimeFormatted}&endTime=${selectedEndTimeFormatted}`
    );
  };

  const handleSearch = () => {
    fetchVehicleRequests();
    fetchUserStatus(); // Also refresh user status when searching
  };

  const fetchVehicleRequests = useCallback(async () => {
    const query = new URLSearchParams();
    query.set("startDate", dayjs(selectedDate).format("YYYY-MM-DD") || "");
    query.set("endDate", dayjs(selectedDate).format("YYYY-MM-DD") || "");
    query.set("startTime", selectedStartTime + "00:00");
    query.set("endTime", selectedEndTime + "00:00");
    setIsLoading(true);
    const response = await fetch(`/api/request?${query.toString()}`);
    const { data } = await response.json();
    setVehicles(data || []);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [selectedDate, selectedStartTime, selectedEndTime]);

  const fetchUserStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/user-status');
      if (response.ok) {
        const data: UserVehicleStatus = await response.json();
        setUserStatus(data);
        setIsUsingVehicle(data.isUsingVehicle);
        setIsOverlapping(data.isOverlapping);
      }
    } catch (error) {
      console.error('Error fetching user status:', error);
    }
  }, []);

  const handleVehicleReturnSuccess = () => {
    // Refresh user status after successful return
    fetchUserStatus();
  };

  useEffect(() => {
    fetchVehicleRequests();
  }, [fetchVehicleRequests]);

  // Fetch user status on mount and set up periodic updates
  useEffect(() => {
    fetchUserStatus();
    
    // Update user status every minute to check for time-based changes
    const interval = setInterval(fetchUserStatus, 60000); // 60 seconds
    
    return () => clearInterval(interval);
  }, [fetchUserStatus]);

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-3 items-center justify-center w-full mt-10">
        {isUsingVehicle && userStatus?.currentUsage && (
          <CheckOut 
            type="inrange" 
            vehicleInfo={{
              requestId: userStatus.currentUsage.id,
              vehicleName: userStatus.currentUsage.vehicleName,
              vehiclePlate: userStatus.currentUsage.vehiclePlate,
              destination: userStatus.currentUsage.destination,
            }}
            onReturnSuccess={handleVehicleReturnSuccess}
          />
        )}
        {isOverlapping && userStatus?.overdueUsage && (
          <CheckOut 
            type="outrange" 
            vehicleInfo={{
              requestId: userStatus.overdueUsage.id,
              vehicleName: userStatus.overdueUsage.vehicleName,
              vehiclePlate: userStatus.overdueUsage.vehiclePlate,
              destination: userStatus.overdueUsage.destination,
              minutesOverdue: userStatus.overdueUsage.minutesOverdue,
            }}
            onReturnSuccess={handleVehicleReturnSuccess}
          />
        )}
      </div>
      <div className="sm:w-3/4 w-11/12 mx-auto flex flex-col gap-6  border-2 border-gray-300 rounded-lg mt-10 items-center p-5">
        <div className="flex flex-col text-center gap-2">
          <h1 className="text-2xl sm:text-5xl font-bold">
            Cari Ketersediaan Kendaraan
          </h1>
          <p className="sm:text-xl text-sm text-gray-500">
            Temukan kendaraan yang tersedia sesuai tanggal dan waktu
          </p>
        </div>

        {/* form box */}
        <div className="flex flex-col gap-6 w-full max-w-2xl">
          {/* Date Selection */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="tanggal"
              className="text-sm font-medium text-gray-700"
            >
              Tanggal Penggunaan
            </label>
            <Datepicker
              minDate={new Date()}
              sizing="lg"
              placeholder="Pilih tanggal"
              value={selectedDate}
              onChange={setSelectedDate}
            />
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="waktu_mulai"
                className="text-sm font-medium text-gray-700"
              >
                Waktu Mulai
              </label>
              <TimePicker
                placeholder="Pilih waktu mulai"
                value={selectedStartTime}
                onChange={setSelectedStartTime}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="waktu_selesai"
                className="text-sm font-medium text-gray-700"
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

          {/* Search Button */}
          <Button
            disabled={isLoading}
            onClick={handleSearch}
            className="w-full bg-gradient-to-br from-purple-600 to-blue-500 "
          >
            {isLoading ? "Mencari..." : "Cari Kendaraan Tersedia"}
          </Button>
        </div>
      </div>
      <div className="mt-10 mb-10 mx-5">
        <h4 className="text-xl sm:text-3xl font-bold">Hasil Pencarian</h4>
        <div className="w-full  border-2 border-gray-300 rounded-lg my-4"></div>
        {isLoading ? (
          <Loading type="card" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:mx-20">
            {vehicles &&
              vehicles.map((vehicle) => (
                <Card
                  key={vehicle.id}
                  id={vehicle.id}
                  title={vehicle.name}
                  plate={vehicle.plate}
                  year={vehicle.year}
                  description={vehicle.type}
                  isAvailable={vehicle.isAvailable}
                  image={vehicle.image || "/default-car.png"}
                  bookings={vehicle.bookings}
                  onClick={() => handleUseClick(vehicle.id)}
                  isOverlapping={vehicle.isOverlapping || false}
                />
              ))}
            {vehicles.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  title="Tidak ada kendaraan"
                  description="Tidak ada kendaraan yang tersedia untuk waktu yang dipilih"
                  icon="/window.svg"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
