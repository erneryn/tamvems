import { Button } from "flowbite-react";
import { useState } from "react";
import { HiCheck, HiX } from "react-icons/hi";

interface VehicleUsageInfo {
  requestId: string;
  vehicleName: string;
  vehiclePlate: string;
  destination: string;
  minutesOverdue?: number;
}

interface CheckOutProps {
  type: "inrange" | "outrange";
  vehicleInfo?: VehicleUsageInfo;
  onReturnSuccess?: () => void;
}

export default function CheckOutInfo({ type, vehicleInfo, onReturnSuccess }: CheckOutProps) {
  const [isReturning, setIsReturning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleReturnVehicle = async () => {
    if (!vehicleInfo?.requestId) {
      setErrorMessage("Informasi kendaraan tidak ditemukan");
      setShowError(true);
      return;
    }

    try {
      setIsReturning(true);
      setShowError(false);

      const response = await fetch('/api/vehicle-return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: vehicleInfo.requestId,
        }),
      });

      if (response.ok) {
        await response.json();
        setShowSuccess(true);
        // reload page
        window.location.reload();
        // Call parent callback to refresh status
        if (onReturnSuccess) {
          onReturnSuccess();
        }

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Gagal mengembalikan kendaraan');
        setShowError(true);
      }
    } catch (error) {
      console.error('Error returning vehicle:', error);
      setErrorMessage('Terjadi kesalahan jaringan');
      setShowError(true);
    } finally {
      setIsReturning(false);
    }
  };

  // Default vehicle info if not provided (for backward compatibility)
  const defaultVehicleInfo = vehicleInfo || {
    requestId: '',
    vehicleName: 'Kendaraan',
    vehiclePlate: 'N/A',
    destination: ''
  };

  return (
    <>
      {type === "inrange" && (    
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Status Icon & Info */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg md:text-xl font-bold text-green-800">
                      Sedang Menggunakan Kendaraan
                    </h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Aktif
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm md:text-base font-semibold text-gray-900">
                      📍 {defaultVehicleInfo.vehiclePlate}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Tujuan:</span> {defaultVehicleInfo.destination}
                    </p>
                    <p className="text-xs text-gray-500">
                      💡 Silakan kembalikan kendaraan setelah selesai menggunakannya
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                <Button 
                  size="lg"
                  className="w-full lg:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={handleReturnVehicle}
                  disabled={isReturning || !vehicleInfo?.requestId}
                >
                  {isReturning ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengembalikan...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Kembalikan Kendaraan
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {type === "outrange" && (
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Status Icon & Info */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg md:text-xl font-bold text-red-800">
                      Kendaraan Melewati Waktu
                    </h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Terlambat
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm md:text-base font-semibold text-gray-900">
                      📍 {defaultVehicleInfo.vehiclePlate}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Tujuan:</span> {defaultVehicleInfo.destination}
                    </p>
                    {vehicleInfo?.minutesOverdue && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-lg">
                          ⏰ Terlambat {vehicleInfo.minutesOverdue} menit
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      ⚠️ Silakan segera kembalikan kendaraan untuk menghindari penalty
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                <Button 
                  size="lg"
                  className="w-full lg:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={handleReturnVehicle}
                  disabled={isReturning || !vehicleInfo?.requestId}
                >
                  {isReturning ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengembalikan...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Kembalikan Sekarang
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 left-4 md:left-auto z-50 max-w-md">
          <div className="bg-white border border-green-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <HiCheck className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Berhasil!
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Kendaraan berhasil dikembalikan
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <HiX className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showError && (
        <div className="fixed top-4 right-4 left-4 md:left-auto z-50 max-w-md">
          <div className="bg-white border border-red-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
                    <HiX className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Gagal!
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {errorMessage}
                  </p>
                </div>
                <button
                  onClick={() => setShowError(false)}
                  className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <HiX className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-red-500 to-rose-500"></div>
          </div>
        </div>
      )}
    </>
  );
}