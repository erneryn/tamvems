"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { HiTruck, HiInformationCircle, HiUpload, HiX } from "react-icons/hi";
import Image from "next/image";

const vehicleTypes = [
  { value: "BENSIN", label: "Bensin" },
  { value: "DIESEL", label: "Diesel" },
  { value: "ELECTRIC", label: "Listrik" },
];

// Generate year options (current year back to 30 years)
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 31 }, (_, i) => currentYear - i);

export default function VehicleRegisterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plateInput, setPlateInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCheckingPlate, setIsCheckingPlate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plateCheckTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  // Check if plate number already exists
  const checkPlateExists = async (plate: string) => {
    if (!plate) return;
    
    try {
      setIsCheckingPlate(true);
      const response = await fetch(`/api/vehicles/check-plate?plate=${encodeURIComponent(plate)}`);
      const data = await response.json();
      
      if (data.exists) {
        setError("Nomor plat ini sudah terdaftar dalam sistem");
      } else {
        setError(null);
      }
    } catch (err) {
      console.error("Error checking plate:", err);
    } finally {
      setIsCheckingPlate(false);
    }
  };

  // Format plate number as user types
  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove spaces and convert to uppercase, only allow letters and numbers
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setPlateInput(value);

    // Clear any existing timeout
    if (plateCheckTimeout.current) {
      clearTimeout(plateCheckTimeout.current);
    }

    // Only check if plate has at least 4 characters
    if (value.length >= 4) {
      // Set a new timeout to check after typing stops
      plateCheckTimeout.current = setTimeout(() => {
        checkPlateExists(value);
      }, 500);
    } else {
      setError(null);
    }
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Don't submit if we're still checking the plate
    if (isCheckingPlate) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      // If we have a selected file in state, use it instead of the file input
      if (selectedFile) {
        formData.set('image', selectedFile);
      }

      const response = await fetch('/api/vehicles', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat mendaftarkan kendaraan');
      }

      // Success! Redirect to vehicles list
      router.push('/admin/vehicles?success=registered');
      router.refresh(); // Refresh the page data

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <div className="rounded-full bg-blue-100 p-3 mr-4">
          <HiTruck className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftarkan Kendaraan Baru</h1>
          <p className="text-gray-600">Tambahkan kendaraan baru ke dalam sistem</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <HiInformationCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Vehicle Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nama Kendaraan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Contoh: Toyota Avanza 2020"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Masukkan nama lengkap kendaraan termasuk merk dan model
          </p>
        </div>

        {/* License Plate */}
        <div>
          <label htmlFor="plate" className="block text-sm font-medium text-gray-700 mb-2">
            Nomor Plat <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="plate"
            name="plate"
            value={plateInput}
            onChange={handlePlateChange}
            placeholder="B1234ABC"
            maxLength={11}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono text-lg tracking-wider"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Format: XXYYYYXX (huruf dan angka tanpa spasi, akan diubah ke huruf besar otomatis)
          </p>
        </div>

        {/* Vehicle Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Bahan Bakar <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            name="type"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          >
            <option value="">Pilih tipe kendaraan</option>
            {vehicleTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Pilih jenis bahan bakar kendaraan
          </p>
        </div>

        {/* Vehicle Year */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
            Tahun Kendaraan <span className="text-red-500">*</span>
          </label>
          <select
            id="year"
            name="year"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          >
            <option value="">Pilih tahun</option>
            {yearOptions.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Tahun pembuatan atau registrasi kendaraan
          </p>
        </div>

        {/* Vehicle Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foto Kendaraan <span className="text-red-500">*</span>
          </label>
          
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
                      htmlFor="image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload foto</span>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        ref={fileInputRef}
                        className="sr-only"
                        accept="image/jpeg,image/png,image/tiff"
                        onChange={handleImageChange}
                        required
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
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            Batal
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || isCheckingPlate || error !== null}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Mendaftarkan...</span>
              </div>
            ) : (
              "Daftarkan Kendaraan"
            )}
          </button>
        </div>
      </form>

      {/* Help Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Informasi Penting:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Pastikan nomor plat kendaraan sudah benar dan belum terdaftar</li>
          <li>• Nama kendaraan sebaiknya mencakup merk, model, dan tahun</li>
          <li>• Foto kendaraan sebaiknya menampilkan kendaraan secara jelas</li>
          <li>• Format foto yang didukung: JPG, PNG, atau TIFF (maks. 5MB)</li>
        </ul>
      </div>
    </div>
  );
}
