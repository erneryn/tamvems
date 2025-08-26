import Image from "next/image";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
}

export default function EmptyState({
  title = "Tidak ada data",
  description = "Tidak ada kendaraan tersedia",
  icon = "/window.svg",
}: EmptyStateProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
      <div className="relative w-24 h-24 mb-4">
        <Image
          src={icon}
          alt="Empty state illustration"
          fill
          className="object-contain"
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

