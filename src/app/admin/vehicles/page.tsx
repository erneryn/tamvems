"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Button,
  Card,
  TextInput,
  Badge,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Modal,
  ModalHeader,
  ModalBody,
} from "flowbite-react";

import {
  HiPlus,
  HiTruck,
  HiSearch,
  HiCheckCircle,
  HiXCircle,
} from "react-icons/hi";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  type: "BENSIN" | "DIESEL" | "ELECTRIC";
  year: string;
  image: string | null;
  isActive: boolean;
  createdAt: string;
}

const typeLabels = {
  BENSIN: { label: "Bensin", color: "info" },
  DIESEL: { label: "Diesel", color: "warning" },
  ELECTRIC: { label: "Listrik", color: "success" },
} as const;

function AdminVehiclesContent() {

  const searchParams = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Show success message if redirected from registration
  const showSuccess = searchParams.get("success") === "registered";

  // Fetch vehicles data
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch("/api/vehicles");
        if (!response.ok) {
          throw new Error("Failed to fetch vehicles");
        }
        const data = await response.json();
        setVehicles(data.vehicles);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load vehicles"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.year.includes(searchTerm)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <HiTruck className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Kelola Kendaraan</h1>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <HiCheckCircle className="h-5 w-5 text-green-500 mr-3" />
          <p className="text-green-700">Kendaraan berhasil didaftarkan!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <HiXCircle className="h-5 w-5 text-red-500 mr-3" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 max-w-md">
          <TextInput
            type="text"
            icon={HiSearch}
            placeholder="Cari kendaraan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button href="/admin/vehicles/register" className="shrink-0">
          <HiPlus className="h-4 w-4 mr-2" />
          Tambah Kendaraan
        </Button>
      </div>

      <Modal
        show={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      >
        <ModalHeader>
          <span className="text-lg font-semibold text-gray-900">
            Foto Kendaraan
          </span>
        </ModalHeader>
        <ModalBody>
          <Image
            src={selectedImage || ""}
            alt="Selected Image"
            width={1000}
            height={1000}
            objectFit="contain"
          />
        </ModalBody>
      </Modal>

      {/* Vehicles Table */}
      <Card className="w-full overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table hoverable>
              <TableHead className="text-xs text-gray-700 uppercase bg-gray-50">
                <TableRow>
                  <TableHeadCell scope="col" className="px-6 py-3 w-40">
                    Foto
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    Nama
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    Plat Nomor
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    Tipe
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    Tahun
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    Status
                  </TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y">
                {filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-gray-500"
                    >
                      {searchTerm
                        ? "Tidak ada kendaraan yang sesuai dengan pencarian"
                        : "Belum ada kendaraan terdaftar"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id} className="bg-white">
                      <TableCell>
                        {vehicle.image ? (
                          <div 
                            className="relative rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
                            onClick={() => setSelectedImage(vehicle.image)}
                          >
                            <Image
                              src={vehicle.image}
                              alt={vehicle.name}
                              width={200}
                              height={200}
                              objectFit="cover"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-42 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            <HiTruck className="h-10 w-14 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {vehicle.name}
                      </TableCell>
                      <TableCell className="font-mono">
                        {vehicle.plate}
                      </TableCell>
                      <TableCell className="font-mono text-center">
                          <Badge color={typeLabels[vehicle.type].color} className="flex items-center justify-center">
                            {typeLabels[vehicle.type].label}
                          </Badge>
                      </TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>
                        <Badge color={vehicle.isActive ? "success" : "gray"} className="flex items-center justify-center">
                          {vehicle.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function AdminVehicles() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center p-8"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <AdminVehiclesContent />
    </Suspense>
  );
}
