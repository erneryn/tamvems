"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Card,
  TextInput,
  Label,
  Spinner,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
} from "flowbite-react";
import {
  HiArrowLeft,
  HiSave,
  HiTrash,
  HiExclamationCircle,
  HiTruck,
  HiUpload,
  HiX,
} from "react-icons/hi";
import Image from "next/image";

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
  BENSIN: "Bensin",
  DIESEL: "Diesel",
  ELECTRIC: "Listrik",
};

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    plate: "",
    type: "BENSIN" as "BENSIN" | "DIESEL" | "ELECTRIC",
    year: "",
  });

  // Fetch vehicle data
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`/api/vehicles/${vehicleId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch vehicle");
        }
        const vehicleData = await response.json();
        setVehicle(vehicleData);
        setFormData({
          name: vehicleData.name,
          plate: vehicleData.plate,
          type: vehicleData.type,
          year: vehicleData.year,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load vehicle"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (vehicleId) {
      fetchVehicle();
    }
  }, [vehicleId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file terlalu besar (maksimal 5MB)");
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/tiff'].includes(file.type)) {
      setError("Format file tidak didukung (gunakan JPG, PNG, atau TIFF)");
      return;
    }

    // Store the selected file
    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      let requestBody;
      const headers: HeadersInit = {};

      // If we have a new file to upload, use FormData
      if (selectedFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('plate', formData.plate);
        formDataToSend.append('type', formData.type);
        formDataToSend.append('year', formData.year);
        formDataToSend.append('image', selectedFile);
        requestBody = formDataToSend;
      } else {
        // If no new file, send JSON data
        headers['Content-Type'] = 'application/json';
        requestBody = JSON.stringify({
          ...formData,
          image: null // Don't update image if no new file
        });
      }

      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PUT",
        headers,
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error("Failed to update vehicle");
      }

      const updatedVehicle = await response.json();
      setVehicle(updatedVehicle);
      setSuccess("Kendaraan berhasil diperbarui!");
      
      // Clear file selection after successful update
      setSelectedFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update vehicle"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete vehicle");
      }

      // Redirect to vehicles page with success message
      router.push("/admin/vehicles?success=deleted");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete vehicle"
      );
      setIsDeleting(false);
    }
    setShowDeleteModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !vehicle) {
    return (
      <div className="p-6">
        <Alert color="failure" className="mb-4">
          {error}
        </Alert>
        <Button href="/admin/vehicles">
          <HiArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar Kendaraan
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            color="gray"
            onClick={() => router.back()}
          >
            <HiArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div className="flex items-center space-x-2">
            <HiTruck className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Detail Kendaraan
            </h1>
          </div>
        </div>
        <Button
          color="failure"
          onClick={() => setShowDeleteModal(true)}
          disabled={isDeleting}
        >
          <HiTrash className="h-4 w-4 mr-2" />
          Hapus Kendaraan
        </Button>
      </div>

      {/* Success Message */}
      {success && (
        <Alert color="success" className="mb-4">
          {success}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert color="failure" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Image */}
        <Card className="h-fit">
          <h3 className="text-lg font-semibold mb-4">Foto Kendaraan</h3>
          {vehicle?.image ? (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image
                src={vehicle.image}
                alt={vehicle.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <HiTruck className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </Card>

        {/* Edit Form */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Edit Kendaraan</h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Kendaraan</Label>
              <TextInput
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="plate">Plat Nomor</Label>
              <TextInput
                id="plate"
                name="plate"
                type="text"
                value={formData.plate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Bahan Bakar</Label>
              <Select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="BENSIN">Bensin</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Listrik</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="year">Tahun</Label>
              <TextInput
                id="year"
                name="year"
                type="text"
                value={formData.year}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Vehicle Image Upload */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Foto Kendaraan
              </Label>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={200}
                        height={200}
                        className="mx-auto object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                      >
                        <HiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <HiUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload foto baru</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            ref={fileInputRef}
                            className="sr-only"
                            accept="image/jpeg,image/png,image/tiff"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">atau drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, TIFF hingga 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
              {!imagePreview && !selectedFile && (
                <p className="mt-2 text-sm text-gray-500">
                  Kosongkan jika tidak ingin mengubah foto kendaraan
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <HiSave className="h-4 w-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>

      {/* Vehicle Info */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Informasi Kendaraan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">ID Kendaraan</p>
            <p className="font-mono text-sm">{vehicle?.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className={`font-medium ${vehicle?.isActive ? 'text-green-600' : 'text-gray-600'}`}>
              {vehicle?.isActive ? 'Aktif' : 'Nonaktif'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tipe Saat Ini</p>
            <p className="font-medium">{vehicle?.type && typeLabels[vehicle.type]}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Dibuat Pada</p>
            <p className="text-sm">
              {vehicle?.createdAt && new Date(vehicle.createdAt).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader>
          <div className="flex items-center space-x-2">
            <HiExclamationCircle className="h-6 w-6 text-red-500" />
            <span>Konfirmasi Hapus</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600">
            Apakah Anda yakin ingin menghapus kendaraan{" "}
            <span className="font-semibold">{vehicle?.name}</span> dengan plat nomor{" "}
            <span className="font-semibold">{vehicle?.plate}</span>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            Tindakan ini akan menonaktifkan kendaraan dan tidak dapat dibatalkan.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            color="gray"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            color="failure"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Menghapus...
              </>
            ) : (
              <>
                <HiTrash className="h-4 w-4 mr-2" />
                Hapus Kendaraan
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
