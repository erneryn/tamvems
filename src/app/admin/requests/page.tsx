"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Button,
  Badge,
  Spinner,
  Select,
  Pagination,
} from "flowbite-react";
import { HiClipboardList, HiChevronUp, HiChevronDown, HiPhone, HiDocumentText, HiPhotograph } from "react-icons/hi";
import { VehicleRequest, User, Vehicle, RequestStatus } from "@prisma/client";
import dayjs from "dayjs";
import ConfirmationModal from "@/components/ConfirmationModal";
import CheckOutModal from "@/components/CheckOutModal";
import { useSearchParams } from "next/navigation";

interface RequestData extends VehicleRequest {
  user: User;
  vehicle: Vehicle;
}

type SortField = "startDateTime" | "endDateTime" | "createdAt";
type SortOrder = "asc" | "desc";

const statusLabels = {
  PENDING: { label: "Menunggu", color: "warning" },
  APPROVED: { label: "Disetujui", color: "success" },
  REJECTED: { label: "Ditolak", color: "failure" },
  IN_USE: { label: "Sedang Digunakan", color: "info" },
  COMPLETED: { label: "Selesai", color: "gray" },
  CANCELLED: { label: "Dibatalkan", color: "dark" },
  OVERDUE: { label: "Belum Kembali", color: "failure" },
} as const;

function AdminRequestsContent() {
  const searchParams = useSearchParams();

  const [requests, setRequests] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "ALL" | "OVERDUE">(
    "ALL"
  );
  const [sortField, setSortField] = useState<SortField>("startDateTime");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showModal, setShowModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(
    null
  );

  const itemsPerPage = 10;

  const fetchRequests = useCallback(async () => {
    const isOverdue = searchParams.get("isOverdue") === "true" || false;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy: sortField,
        sortOrder: sortOrder,
      });

      if (statusFilter !== "ALL" && statusFilter !== "OVERDUE") {
        params.append("status", statusFilter);
      }

      if (statusFilter === "OVERDUE" || isOverdue) {
        params.append("status", "APPROVED");
        params.append("isOverdue", "true");
      }

      const response = await fetch(`/api/admin/request?${params.toString()}`);
      const responseData = await response.json();

      // Handle the new API response structure
      if (responseData.data && responseData.pagination) {
        setRequests(responseData.data);
        setTotalPages(responseData.pagination.totalPages);
      } else {
        // Fallback for old API structure
        setRequests(responseData);
        setTotalPages(Math.ceil(responseData.length / itemsPerPage));
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, sortField, sortOrder, itemsPerPage, searchParams]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: RequestStatus,
    rejectionReason?: string
  ) => {
    try {
      const response = await fetch("/api/admin/request", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
          rejectionReason,
        }),
      });

      if (response.ok) {
        fetchRequests(); // Refresh the data
        setShowModal(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const openConfirmationModal = (request: RequestData) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const openCheckOutConfirmationModal = (request: RequestData) => {
    setSelectedRequest(request);
    setShowCheckOutModal(true);
  };

  const handleApprove = () => {
    if (selectedRequest) {
      handleStatusUpdate(selectedRequest.id, "APPROVED");
    }
  };

  const handleRejectApi = (reason: string) => {
    if (selectedRequest) {
      handleStatusUpdate(selectedRequest.id, "REJECTED", reason);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setShowCheckOutModal(false);
    setSelectedRequest(null);
  };

  const handleCheckOut = async () => {
    const isOverdue = searchParams.get("isOverdue") === "true" || false;
    if (!selectedRequest) return;

    try {
      const response = await fetch("/api/admin/request", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedRequest.id,
          status: "COMPLETED",
          checkOutAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        fetchRequests(); // Refresh the data
        setShowCheckOutModal(false);
        setSelectedRequest(null);
      }

      if(isOverdue) {
        removeIsOverdueFromUrl();
      }



    } catch (error) {
      console.error("Error checking out request:", error);
    }
  };

  const checkIsOverdue = (request: RequestData) => {
    return dayjs(request.endDateTime).isBefore(dayjs());
  }

  const removeIsOverdueFromUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("isOverdue");
    window.history.replaceState({}, "", url.toString());
  }

  const handleStatusFilterChange = (status: RequestStatus | "ALL" | "OVERDUE") => {
    const isOverdue = searchParams.get("isOverdue") === "true" || false;

    setStatusFilter(status);
    setCurrentPage(1);

    if(isOverdue) {
      removeIsOverdueFromUrl();
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <HiChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <HiChevronDown className="w-4 h-4 ml-1" />
    );
  };

  const renderButtonStatus = (request: RequestData) => {
    if (request.status === "APPROVED") {
      const isOverdue = dayjs(request.endDateTime).isBefore(dayjs());
      if (isOverdue) {
        return (
          <>
            <Badge color={statusLabels[request.status].color} size="sm">
              {statusLabels[request.status].label}
            </Badge>
            <Badge color="failure" size="sm" className="mt-2">
              {statusLabels["OVERDUE"].label}
            </Badge>
          </>
        );
      }
    }
    return (
      <Badge color={statusLabels[request.status].color} size="sm">
        {statusLabels[request.status].label}
      </Badge>
    );
  };

  // Check if document URL is a PDF
  const isPdfDocument = (url: string | null | undefined): boolean => {
    if (!url) return false;
    return url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('/raw/');
  };

  // Render document link
  const renderDocumentLink = (request: RequestData) => {
    if (!request.documentUrl) {
      return <span className="text-gray-400">—</span>;
    }

    const isPdf = isPdfDocument(request.documentUrl);
    
    return (
      <a
        href={request.documentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
        title={isPdf ? "Lihat PDF" : "Lihat Gambar"}
      >
        {isPdf ? (
          <HiDocumentText className="w-5 h-5" />
        ) : (
          <HiPhotograph className="w-5 h-5" />
        )}
        <span className="ml-1 text-xs">Lihat</span>
      </a>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <HiClipboardList className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Kelola Pengajuan</h1>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            Filter Status:
          </label>
          <Select
            value={statusFilter}
            onChange={(e) =>
              handleStatusFilterChange(e.target.value as RequestStatus | "ALL" | "OVERDUE")
            }
            className="w-48"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
            <option value="COMPLETED">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
            <option value="OVERDUE">Belum Kembali</option>
          </Select>
        </div>
      </div>

      {/* Requests Table */}
      <Card className="w-full overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table hoverable>
                <TableHead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <TableRow>
                    <TableHeadCell scope="col" className="px-6 py-3">
                      Pemohon
                    </TableHeadCell>
                    <TableHeadCell scope="col" className="px-6 py-3">
                      Kendaraan
                    </TableHeadCell>
                    <TableHeadCell scope="col" className="px-6 py-3 max-w-[200px]">
                      Deskripsi
                    </TableHeadCell>
                    <TableHeadCell scope="col" className="px-6 py-3">
                      Tujuan
                    </TableHeadCell>
                    <TableHeadCell scope="col" className="px-6 py-3">
                      Dokumen
                    </TableHeadCell>
                    <TableHeadCell
                      scope="col"
                      className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("startDateTime")}
                    >
                      <div className="flex items-center">
                        Mulai
                        {renderSortIcon("startDateTime")}
                      </div>
                    </TableHeadCell>
                    <TableHeadCell
                      scope="col"
                      className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("endDateTime")}
                    >
                      <div className="flex items-center">
                        Selesai
                        {renderSortIcon("endDateTime")}
                      </div>
                    </TableHeadCell>
                    <TableHeadCell scope="col" className="px-6 py-3">
                      Status
                    </TableHeadCell>
                    <TableHeadCell scope="col" className="px-6 py-3">
                      Aksi
                    </TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody className="divide-y">
                  {requests.length > 0 ? (
                    requests.map((request) => (
                      <TableRow
                        key={request.id}
                        className="bg-white hover:bg-gray-50"
                      >
                        <TableCell className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.user.employeeId}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <HiPhone className="w-4 h-4 mr-2" />
                              {request.user.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.vehicle.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.vehicle.plate}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 max-w-[200px]">
                          <span className="line-clamp-1 text-sm text-gray-600" title={request.vehicle.description ?? undefined}>
                            {request.vehicle.description?.trim() || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-gray-900">
                          {request.destination}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-gray-900">
                          {renderDocumentLink(request)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-gray-900">
                          {dayjs(request.startDateTime).format(
                            "DD/MM/YYYY HH:mm"
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-gray-900">
                          {dayjs(request.endDateTime).format(
                            "DD/MM/YYYY HH:mm"
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {renderButtonStatus(request)}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {request.status === "PENDING" && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                pill
                                onClick={() => openConfirmationModal(request)}
                              >
                                Tindakan
                              </Button>
                            </div>
                          )}
                          {request.status === "APPROVED" && checkIsOverdue(request) && (
                              <Button
                                size="sm"
                                pill
                                className="w-24"
                                color="red"
                                onClick={() => openCheckOutConfirmationModal(request)}
                              >
                                Kembalikan
                              </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <HiClipboardList className="h-12 w-12 text-gray-300" />
                          <p className="text-gray-500">
                            Tidak ada pengajuan ditemukan
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  showIcons
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Confirmation Modal */}
      {showModal && selectedRequest && (
        <ConfirmationModal
          handleCancel={handleCancel}
          handleApprove={handleApprove}
          handleRejectApi={handleRejectApi}
          selectedRequest={selectedRequest}
        />
      )}

      {showCheckOutModal && selectedRequest && (
        <CheckOutModal
          handleCancel={handleCancel}
          selectedRequest={selectedRequest}
          handleCheckOut={handleCheckOut}
        />
      )}
    </div>
  );
}

export default function AdminRequests() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center p-8"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <AdminRequestsContent />
    </Suspense>
  );
}
