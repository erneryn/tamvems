import dayjs from "dayjs";
import { Button } from "flowbite-react";
import Image from "next/image";

const InfoStatus: Record<string, string> = {
  "PENDING": "Dalam proses pengajuan kepada admin",
  "APPROVED":
    "Mohon gunakan kendaraan sesuai dengan waktu yang telah ditentukan",
  "WAITING":
    "Pengajuan anda telah disetujui, namun sampai saat ini kendaraan masih digunakan oleh pengguna lain",
  "COMPLETED":
    "Kendaraan sudah dikembalikan",
  "CANCELLED":
    "Pengajuan anda telah dibatalkan",
};

export default function Card({
  title,
  plate,
  requestDate,
  requestTime,
  returnTime,
  status,
  image,
  isIdle = true,
  checkOutAt,
  buttonStatus,
  rejectionReason,
}: {
  title: string;
  plate: string;
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
  const getInfoStatus = (isIdle: boolean, status: string) => {
    if (status === "APPROVED" && !isIdle) {
      return InfoStatus["WAITING"];
    }
    return InfoStatus[status?.toUpperCase()] || "";
  };

  const generateButtonCheckout = () => {
    if(buttonStatus === "warning") {
      return <>
      <span className="text-sm text-gray-500">
        Kendaraan sudah melebihi Hari yang telah ditentukan
      </span>
      <Button pill  className="px-5 bg-red-500 text-white">
        Check Out
      </Button>
      </>
    }
    if(buttonStatus === "overTime") {
      return <>
      <span className="text-sm text-gray-500">
        Kendaraan sudah melebihi jam yang telah ditentukan
      </span>
      <Button pill  className="px-5 bg-yellow-500 text-white">
        Check Out
      </Button>
      </>
    }
    if(buttonStatus === "onTime") {
      return <Button pill  className="px-5 bg-green-500 text-white">
        Check Out
      </Button>
    }
  }
  return (
    <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 bg-gray-100 rounded-lg p-4">
      <div className="w-full md:w-1/2">
        <div className="flex flex-col w-full">
          <div className="p-1 border-b-2 border-gray-300 flex flex-col sm:flex-row sm:">
            <div className="mb-2 sm:mb-0">
              <h1 className="text-sm font-bold">Nama Kendaraan</h1>
              <span className="text-sm text-gray-500 break-words">{title}</span>
            </div>
            <div className="sm:ml-4 sm:max-w-2xl">
              <h1 className="text-sm font-bold">Plat Nomor</h1>
              <span className="text-sm text-gray-500">{plate}</span>
            </div>
          </div>

          <div className="p-1 border-b-2 border-gray-300">
            <h1 className="text-sm font-bold">Tanggal Pengajuan</h1>
              <span className="text-sm text-gray-500">{dayjs(requestDate).format("DD-MM-YYYY")}</span>
          </div>
          
          <div className="p-1 border-b-2 border-gray-300 flex flex-col sm:flex-row sm:">
            <div className="mb-2 sm:mb-0">
              <h1 className="text-sm font-bold">Jam Penggunaan</h1>
              <span className="text-sm text-gray-500">{requestTime}</span>
            </div>
            <div className="sm:ml-4 sm:max-w-2xl">
              <h1 className="text-sm font-bold">Jam Kembali</h1>
              <span className="text-sm text-gray-500">{returnTime}</span>
            </div>
          </div>

          <div className="p-1 pb-3 border-b-2 border-gray-300">
            <h1 className="text-sm font-bold mb-2">Status</h1>
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
                <span className="inline-block  px-5 py-2 text-xs font-semibold text-black ">
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
                      Kendaraan Belum Kembali
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
