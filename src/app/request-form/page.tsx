"use client";
import {
  Button,
  Label,
  TextInput,
  ToastToggle,
  FileInput,
} from "flowbite-react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import { Vehicle } from "@prisma/client";
import Loading from "@/components/Loading";
import { useSession } from "next-auth/react";
import { Toast } from "flowbite-react";
import { HiCheck, HiX, HiDocumentText } from "react-icons/hi";
import dayjs from "dayjs";

// Constants for file validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

// Interface for API error responses
interface ApiErrorResponse {
  error?: string;
  errorCode?: string;
  details?: unknown;
}

function PengajuanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vehicleId = searchParams.get("vehicleId");
  const requestDate = searchParams.get("date");
  const requestStartTime = searchParams.get("startTime");
  const requestEndTime = searchParams.get("endTime");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [keperluan, setKeperluan] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Terjadi kesalahan saat mengirim pengajuan. Silakan coba lagi.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const session = useSession();
  const user = session.data?.user;

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) {
      setDocumentFile(null);
      setDocumentPreview(null);
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError("Tipe file tidak valid. Gunakan PDF, JPEG, atau PNG.");
      setDocumentFile(null);
      setDocumentPreview(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError("Ukuran file terlalu besar. Maksimal 5MB.");
      setDocumentFile(null);
      setDocumentPreview(null);
      return;
    }

    setDocumentFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setDocumentPreview(null);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setDocumentFile(null);
    setDocumentPreview(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const fetchVehicle = async () => {
      if (vehicleId) {
        try {
          const res = await fetch(`/api/vehicles/${vehicleId}`);
          const data = await res.json();
          setVehicle(data);
        } catch (error) {
          console.error("Error fetching vehicle:", error);
        }
      }
    };
    fetchVehicle();
  }, [vehicleId]);

  // Countdown and redirect effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isSuccess && countdown === 0) {
      router.push("/my-request");
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsError(false);

    try {
      // Use FormData to support file upload
      const formData = new FormData();
      formData.append('vehicleId', vehicleId || '');
      formData.append('destination', keperluan);
      formData.append('startDate', requestDate || '');
      formData.append('endDate', requestDate || '');
      formData.append('startTime', requestStartTime || '');
      formData.append('endTime', requestEndTime || '');
      
      if (documentFile) {
        formData.append('document', documentFile);
      }

      const res = await fetch("/api/request", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setIsSuccess(true);
        setCountdown(4); // Reset countdown
      } else {
        // Handle HTTP error responses
        try {
          const errorData: ApiErrorResponse = await res.json();
          
          if (errorData.errorCode === "MAX_REQUEST_PER_DAY") {
            setErrorMessage("Maximum pengajuan per divisi hari ini sudah tercapai (2)");
          } else if (errorData.error) {
            setErrorMessage(errorData.error);
          } else {
            setErrorMessage("Terjadi kesalahan saat mengirim pengajuan. Silakan coba lagi.");
          }
        } catch (parseError) {
          // If we can't parse the error response, use default message
          console.error("Error parsing error response:", parseError);
          setErrorMessage("Terjadi kesalahan saat mengirim pengajuan. Silakan coba lagi.");
        }
        
        setIsError(true);
      }
    } catch (error) {
      // Handle network errors or other JavaScript errors
      console.error("Network error submitting request:", error);
      setIsError(true);
      setErrorMessage("Terjadi kesalahan jaringan. Periksa koneksi internet Anda.");
    }

    setIsSubmitting(false);
  };

  const handleErrorReset = () => {
    setIsError(false);
  };

  if (!vehicle) {
    return <Loading type="form" />;
  }

  return (
    <div className="container mx-auto">
      <div
        className="relative w-full lg:w-3/4 mx-auto border-2 border-gray-300 rounded-lg p-10 my-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/bg-form.jpg)" }}
      >
        <div className="absolute inset-0 bg-white opacity-80 rounded-lg"></div>
        <div className="relative z-10 sm:p-10">
          <h1 className="text-3xl text-center font-bold uppercase">
            Form Pengajuan penggunaan kendaraan
          </h1>
          <div className="w-full sm:flex justify-center mt-10 border-2 p-5 border-gray-300 rounded-lg">
            <div className="sm:w-1/2 p-5">
              <div className="relative w-full sm:h-64 rounded-2xl overflow-hidden">
                <Image
                  className="rounded-2xl"
                  src={vehicle.image || "/default-car.png"}
                  alt="kendaraan"
                  width={500}
                  height={500}
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              </div>
            </div>
            <div className="flex justify-start flex-col sm:w-1/2">
              <div className="p-2 border-b-2  border-gray-300">
                <h1 className="text-lg font-bold ">Nama Kendaraan</h1>
                <span className="text-xl text-gray-500">{vehicle.name}</span>
              </div>
              <div className="p-2 border-b-2  border-gray-300">
                <h1 className="text-lg font-bold">Plat Nomor</h1>
                <span className="text-xl text-gray-500">{vehicle.plate}</span>
              </div>
              <div className="p-2 border-b-2  border-gray-300">
                <h1 className="text-lg font-bold">Jenis Kendaraan</h1>
                <span className="text-xl text-gray-500">{vehicle.type}</span>
              </div>
              <div className="p-2 border-b-2  border-gray-300">
                <h1 className="text-lg font-bold">Tanggal Penggunaan</h1>
                <span className="text-xl text-gray-500">
                  {dayjs(requestDate).format("DD-MM-YYYY")}
                </span>
              </div>
              <div className="p-2 border-b-2  border-gray-300">
                <h1 className="text-lg font-bold">Jam Penggunaan</h1>
                <span className="text-xl text-gray-500">
                  {requestStartTime}:00 - {requestEndTime}:00
                </span>
              </div>
              {vehicle.description?.trim() && (
                <div className="p-2 border-b-2  border-gray-300">
                  <h1 className="text-lg font-bold">Deskripsi</h1>
                  <span className="text-xl text-gray-500 whitespace-pre-wrap">{vehicle.description}</span>
                </div>
              )}
            </div>
          </div>
          <div className="w-full flex justify-center">
            <form
              className="flex w-full flex-col gap-4 mt-5"
              onSubmit={handleSubmit}
            >
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="nama">Nama Pengguna</Label>
                </div>
                <TextInput
                  id="nama"
                  type="text"
                  value={user?.name || ""}
                  disabled
                  shadow
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="keperluan">Keperluan</Label>
                </div>
                <TextInput
                  id="keperluan"
                  type="text"
                  placeholder="Keperluan"
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  shadow
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="document">Dokumen Surat Tugas (Wajib)</Label>
                </div>
                <FileInput
                  id="document"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  color={fileError ? "failure" : undefined}
                />
                <p className="mt-1 text-xs text-gray-500">Wajib. PDF, JPEG, atau PNG. Maks 5MB.</p>
                {fileError && (
                  <p className="mt-1 text-sm text-red-600">{fileError}</p>
                )}
                {documentFile && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {documentPreview ? (
                          <div className="relative w-16 h-16 rounded overflow-hidden">
                            <Image
                              src={documentPreview}
                              alt="Preview"
                              fill
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center">
                            <HiDocumentText className="w-6 h-6 text-red-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                            {documentFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <HiX className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                disabled={keperluan === "" || isSubmitting || !!fileError || !documentFile}
              >
                {isSubmitting ? "Mengirim..." : "Submit Pengajuan"}
              </Button>
            </form>
          </div>

          {/* Success Toast */}
          {isSuccess && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <Toast className="relative z-50 w-96 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white py-10">
                <div className="flex items-start">
                  <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500">
                    <HiCheck className="h-5 w-5" />
                  </div>
                  <div className="ml-3 text-sm font-normal">
                    <div className="mb-1 text-sm font-semibold text-gray-900">
                      Pengajuan Berhasil!
                    </div>
                    <div className="mb-2 text-sm font-normal">
                      Pengajuan Anda telah berhasil dikirim.
                    </div>
                    <div className="text-xs text-white">
                      Mengalihkan ke halaman pengajuan saya dalam {countdown}{" "}
                      detik...
                    </div>
                  </div>
                </div>
              </Toast>
              <div className="fixed z-10 inset-0 flex items-center justify-center bg-gray-500 opacity-50"></div>
            </div>
          )}

          {/* Error Toast */}
          {isError && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <Toast className="relative z-50  bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white">
                <div className="flex items-start">
                  <div className="ml-3 text-sm font-normal">
                    <span className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                      Pengajuan Gagal!
                    </span>
                    <div className="mb-2 text-sm font-normal">
                      {errorMessage}
                    </div>
                    <div className="flex gap-2">
                      <div className="w-auto">
                        <Button
                          onClick={handleErrorReset}
                          color="light"
                          size="xs"
                        >
                          Tutup
                        </Button>
                      </div>
                    </div>
                  </div>
                  <ToastToggle onDismiss={handleErrorReset} />
                </div>
              </Toast>
              <div className="fixed z-10 inset-0 flex items-center justify-center bg-gray-500 opacity-50"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Pengajuan() {
  return (
    <Suspense fallback={<Loading />}>
      <PengajuanContent />
    </Suspense>
  );
}
