import { Button, Card as CardFlowbite } from "flowbite-react";
import { useState } from "react";
import TimeSelectionModal from "./TimeSelectionModal";

export default function Card({
  id,
  title,
  plate,
  description,
  vehicleDescription,
  isAvailable,
  year,
  image,
  horizontal = false,
  onClick,
  bookings,
  isOverlapping,
  pendingCount = 0,
}: {
  id: string;
  title: string;
  plate: string;
  description: string;
  vehicleDescription?: string | null;
  isAvailable: boolean;
  isOverlapping: boolean;
  year: string;
  image: string;
  horizontal?: boolean;
  onClick?: () => void;
  bookings: {
    startDateTime: string;
    endDateTime: string;
  }[];
  pendingCount?: number;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <CardFlowbite
      className="max-w-sm relative"
      imgAlt="Meaningful alt text for an image that is not purely decorative"
      imgSrc={image}
      horizontal={horizontal}
    >
      <div>
        <h5 className="text-2xl font-bold tracking-tight text-gray-900">
          {title}
        </h5>
        <span className="text-xl font-bold tracking-tight text-gray-500 block">
          {plate}
        </span>
      </div>
      <div className="flex flex-col gap-0">
        <p className="font-normal text-gray-700">
          Bahan Bakar: <span className="font-bold ">{description}</span>
        </p>
        <p className="font-normal text-gray-700">
          Tahun: <span className="font-bold ">{year}</span>
        </p>
        {vehicleDescription?.trim() && (
          <p className="font-normal text-gray-700 line-clamp-2" title={vehicleDescription}>
            Deskripsi: <span className="font-bold ">{vehicleDescription}</span>
          </p>
        )}
      </div>
      {!isAvailable ? (
        <span className="text-sm text-gray-500">
          silahkan pilih waktu diluar waktu yang sudah di booking
        </span>
      ) : (
        <Button
          onClick={onClick}
          className="w-full bg-gradient-to-br from-blue-600 to-blue-800  "
        >
          Gunakan
        </Button>
      )}
      <TimeSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicleId={id}
      />
      <div className="absolute top-0 right-0 z-10 p-3 flex flex-col gap-2">
        {isOverlapping && (
          <span className="ml-3 mr-2 rounded bg-red-400 px-5 py-1 text-xs font-semibold text-white ">
            Belum Kembali
          </span>
        )}
        {pendingCount > 0 && (
          <span className="ml-3 mr-2 rounded bg-orange-400 px-5 py-1 text-xs font-semibold text-white ">
            {pendingCount} User Sedang Dalam Pengajuan
          </span>
        )}
        {isAvailable && pendingCount === 0 ? (
          <span className="ml-3 mr-2 rounded bg-green-400 px-5 py-1 text-xs font-semibold text-white ">
            Tersedia Sekarang
          </span>
        ) : (
          bookings.length &&
          bookings.map((booking, index) => (
            <span
              key={index}
              className="ml-3 mr-2 rounded bg-yellow-400 px-5 py-1 text-xs font-semibold text-white "
            >
              Booked {booking.startDateTime} - {booking.endDateTime}
            </span>
          ))
        )}
      </div>
    </CardFlowbite>
  );
}
