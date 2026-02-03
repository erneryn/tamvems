"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
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
  HiPencil,
} from "react-icons/hi";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  type: "BENSIN" | "DIESEL" | "ELECTRIC";
  year: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
}

const typeColors = {
  BENSIN: "info",
  DIESEL: "warning",
  ELECTRIC: "success",
} as const;

function AdminVehiclesContent() {
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const t = translations[locale].admin.vehicles;
  const typeLabels = useMemo(() => ({
    BENSIN: { label: t.fuelBensin, color: typeColors.BENSIN },
    DIESEL: { label: t.fuelDiesel, color: typeColors.DIESEL },
    ELECTRIC: { label: t.fuelElectric, color: typeColors.ELECTRIC },
  }), [locale, t.fuelBensin, t.fuelDiesel, t.fuelElectric]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Show success message if redirected from registration or deletion
  const successType = searchParams.get("success");
  const showSuccess = successType === "registered" || successType === "deleted";

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
      vehicle.year.includes(searchTerm) ||
      (vehicle.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <HiTruck className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <HiCheckCircle className="h-5 w-5 text-green-500 mr-3" />
          <p className="text-green-700">
            {successType === "registered" 
              ? t.successRegistered 
              : t.successDeleted}
          </p>
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
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button href="/admin/vehicles/register" className="shrink-0">
          <HiPlus className="h-4 w-4 mr-2" />
          {t.addVehicle}
        </Button>
      </div>

      <Modal
        show={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      >
        <ModalHeader>
          <span className="text-lg font-semibold text-gray-900">
            {t.photo}
          </span>
        </ModalHeader>
        <ModalBody>
          <Image
            src={selectedImage || ""}
            alt={t.photoAlt}
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
                    {t.photo}
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    {t.name}
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    {t.plateNumber}
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    {t.type}
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    {t.year}
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3 max-w-[200px]">
                    {t.description}
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    {t.status}
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    {t.action}
                  </TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y">
                {filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-10 text-gray-500"
                    >
                      {searchTerm
                        ? t.noVehiclesSearch
                        : t.noVehiclesYet}
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
                      <TableCell className="max-w-[200px]">
                        <span className="line-clamp-2 text-sm text-gray-600" title={vehicle.description ?? undefined}>
                          {vehicle.description?.trim() || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge color={vehicle.isActive ? "success" : "gray"} className="flex items-center justify-center">
                          {vehicle.isActive ? t.active : t.inactive}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          color="blue"
                          href={`/admin/vehicles/${vehicle.id}`}
                          className="flex items-center justify-center"
                        >
                          <HiPencil className="h-4 w-4 mr-1" />
                          {t.edit}
                        </Button>
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
