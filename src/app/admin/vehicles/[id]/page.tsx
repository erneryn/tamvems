"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;
  const { locale } = useLanguage();
  const t = translations[locale].admin.vehicleDetail;
  const vehiclesT = translations[locale].admin.vehicles;
  const typeLabels = useMemo(() => ({
    BENSIN: vehiclesT.fuelBensin,
    DIESEL: vehiclesT.fuelDiesel,
    ELECTRIC: vehiclesT.fuelElectric,
  }), [locale, vehiclesT.fuelBensin, vehiclesT.fuelDiesel, vehiclesT.fuelElectric]);

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
    description: "",
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
          description: vehicleData.description ?? "",
        });
      } catch {
        setError(t.loadError);
      } finally {
        setIsLoading(false);
      }
    };

    if (vehicleId) {
      fetchVehicle();
    }
  }, [vehicleId, t.loadError]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
      setError(t.fileTooBig);
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/tiff'].includes(file.type)) {
      setError(t.fileTypeInvalid);
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
        if (formData.description) formDataToSend.append('description', formData.description);
        formDataToSend.append('image', selectedFile);
        requestBody = formDataToSend;
      } else {
        // If no new file, send JSON data
        headers['Content-Type'] = 'application/json';
        requestBody = JSON.stringify({
          ...formData,
          description: formData.description?.trim() || null,
          image: null // Don't update image if no new file
        });
      }

      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PUT",
        headers,
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error(t.updateError);
      }

      const updatedVehicle = await response.json();
      setVehicle(updatedVehicle);
      setSuccess(t.updateSuccess);
      
      // Clear file selection after successful update
      setSelectedFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError(t.updateError);
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
        throw new Error(t.deleteError);
      }

      // Redirect to vehicles page with success message
      router.push("/admin/vehicles?success=deleted");
    } catch {
      setError(t.deleteError);
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
          {t.backToList}
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
            {t.back}
          </Button>
          <div className="flex items-center space-x-2">
            <HiTruck className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {t.title}
            </h1>
          </div>
        </div>
        <Button
          color="failure"
          onClick={() => setShowDeleteModal(true)}
          disabled={isDeleting}
        >
          <HiTrash className="h-4 w-4 mr-2" />
          {t.deleteVehicle}
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
          <h3 className="text-lg font-semibold mb-4">{t.vehiclePhoto}</h3>
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
          <h3 className="text-lg font-semibold mb-4">{t.editVehicle}</h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="name">{t.nameLabel}</Label>
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
              <Label htmlFor="plate">{t.plateLabel}</Label>
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
              <Label htmlFor="type">{t.fuelType}</Label>
              <Select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="BENSIN">{typeLabels.BENSIN}</option>
                <option value="DIESEL">{typeLabels.DIESEL}</option>
                <option value="ELECTRIC">{typeLabels.ELECTRIC}</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="year">{t.yearLabel}</Label>
              <TextInput
                id="year"
                name="year"
                type="text"
                value={formData.year}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">{t.descriptionOptional}</Label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t.descriptionPlaceholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-y min-h-[100px]"
              />
            </div>

            {/* Vehicle Image Upload */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                {t.vehiclePhoto}
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
                          <span>{t.uploadNewPhoto}</span>
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
                        <p className="pl-1">{t.orDragDrop}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {t.photoHint}
                      </p>
                    </>
                  )}
                </div>
              </div>
              {!imagePreview && !selectedFile && (
                <p className="mt-2 text-sm text-gray-500">
                  {t.clearPhotoHint}
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
                  {t.saving}
                </>
              ) : (
                <>
                  <HiSave className="h-4 w-4 mr-2" />
                  {t.saveChanges}
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>

      {/* Vehicle Info */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">{t.vehicleInfo}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">{t.vehicleId}</p>
            <p className="font-mono text-sm">{vehicle?.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t.status}</p>
            <p className={`font-medium ${vehicle?.isActive ? "text-green-600" : "text-gray-600"}`}>
              {vehicle?.isActive ? t.active : t.inactive}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t.currentType}</p>
            <p className="font-medium">{vehicle?.type && typeLabels[vehicle.type]}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t.createdAt}</p>
            <p className="text-sm">
              {vehicle?.createdAt && new Date(vehicle.createdAt).toLocaleString(locale === "id" ? "id-ID" : "en-GB")}
            </p>
          </div>
          {(vehicle?.description ?? "").trim() && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">{t.description}</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">{vehicle?.description}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader>
          <div className="flex items-center space-x-2">
            <HiExclamationCircle className="h-6 w-6 text-red-500" />
            <span>{t.confirmDelete}</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600">
            {t.confirmDeleteVehicleMessage
              .replace("{name}", vehicle?.name ?? "")
              .replace("{plate}", vehicle?.plate ?? "")}
          </p>
          <p className="text-sm text-red-600 mt-2">
            {t.deleteVehicleWarning}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            color="gray"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            {t.cancel}
          </Button>
          <Button
            color="failure"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {t.deleting}
              </>
            ) : (
              <>
                <HiTrash className="h-4 w-4 mr-2" />
                {t.deleteVehicle}
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
