'use client';

import { Card, Button } from "flowbite-react";
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { HiUserCircle, HiClock, HiCalendar, HiExclamationCircle, HiUsers, HiCheckCircle, HiMail } from "react-icons/hi";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { VehicleRequest, User , Vehicle} from "@prisma/client";
import dayjs from "dayjs";
import ConfirmationModal from "@/components/ConfirmationModal";
import Loading from "@/components/Loading";
import { useRouter } from "next/navigation";

interface RequestData extends VehicleRequest {
  user: User;
  vehicle: Vehicle;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  employeeId: string;
  phone: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  isActive: boolean;
  enablePasswordChanges: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    vehicleRequests: number;
    createdRequests: number;
  };
}


export default function AdminDashboard() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  const [latestRequests, setLatestRequests] = useState<RequestData[]>([]);
  const [todayActivity, setTodayActivity] = useState<RequestData[]>([]);
  const [overdueRequests, setOverdueRequests] = useState<RequestData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const hasInitialized = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const updateDateTime = () => {
    // Update time
    const time = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    setCurrentTime(time);

    // Update date
    const date = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    setCurrentDate(date);
  };

  const getOverdueRequests = async () => {
    try {
      const response = await fetch(`/api/admin/request?status=APPROVED&isOverdue=true`);
      const {data} = await response.json();
      setOverdueRequests(data);
    } catch (error) {
      console.error('Error fetching overdue requests:', error);
    }
  };

  const getLatestRequests = async () => {
    try {
      const response = await fetch(`/api/admin/request?status=PENDING&page=1&limit=5`);
      const {data} = await response.json();
      setLatestRequests(data);
    } catch (error) {
      console.error('Error fetching latest requests:', error);
    }
  };

  const getTodayActivity = async () => {
    try {
      const response = await fetch(`/api/admin/request?status=APPROVED&isToday=true&page=1&limit=10`);
      const {data} = await response.json();
      setTodayActivity(data);
    } catch (error) {
      console.error('Error fetching today activity:', error);
    }
  };

  const getUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    // Update immediately
    updateDateTime();
    // Update every minute
    const interval = setInterval(updateDateTime, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    getLatestRequests();
    getTodayActivity();
    getOverdueRequests();
    getUsers();
  }, []);

  const handleActionClick = (request: RequestData) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      await fetch(`/api/admin/request`, {
        method: "PATCH",
        body: JSON.stringify({ id: selectedRequest?.id, status: "APPROVED" }),
      });
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setSelectedRequest(null);
      setShowModal(false);
      setIsLoading(false);
      getLatestRequests();
      getTodayActivity();
      getUsers();
    }
   
  };

  const handleRejectApi = async (reason: string) => {
    try {
      setIsLoading(true);
      await fetch(`/api/admin/request`, {
        method: "PATCH",
        body: JSON.stringify({ id: selectedRequest?.id, status: "REJECTED", rejectionReason: reason }),
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setIsLoading(false);
      setShowModal(false);
      setSelectedRequest(null);
      getLatestRequests();
      getTodayActivity();
      getUsers();
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="w-full">
        <div className="flex items-center space-x-7">
          <div className="rounded-full bg-gray-100 p-2">
            <HiUserCircle className="h-8 w-8 text-gray-600" />
          </div>
          <div className="flex-1">
            <h5 className="text-xl font-bold tracking-tight text-gray-900">
              Hi Admin
            </h5>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
              <HiCalendar className="h-4 w-4" />
              <span>{currentDate}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
              <HiClock className="h-4 w-4" />
              <span>{currentTime} WIB</span>
            </div>
          </div>
        </div>
      </Card>

      {/* User Statistics Cards */}
      {users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HiUsers className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Pengguna Aktif
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.isActive).length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HiCheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Permintaan
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.reduce((total, user) => total + user._count.vehicleRequests, 0)}
                </p>
              </div>
            </div>
          </Card>

          {/* <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HiMail className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Dengan Nomor Telepon
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.phone).length}
                </p>
              </div>
            </div>
          </Card> */}
        </div>
      )}

    {overdueRequests.length > 0 && (
      <Card className="w-full border-l-4 border-orange-500 bg-orange-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-orange-100 p-2">
              <HiExclamationCircle className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h5 className="text-lg font-bold text-orange-800">
                {overdueRequests.length} Mobil Melewati Batas Waktu Kembali
              </h5>
              <p className="text-sm text-orange-600">
                Terdapat kendaraan yang belum dikembalikan
              </p>
            </div>
          </div>
          <Button 
            color="warning" 
            size="md"
            pill
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2 shadow-lg"
            onClick={() => router.push("/admin/requests?isOverdue=true")}
          >
            Lihat Semua
          </Button>
        </div>
      </Card>
      )}

      <div className="border-b-2 border-gray-300 w-full mb-10"></div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">PENGAJUAN TERBARU</h2>
        <Card className="w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Nama</th>
                  <th scope="col" className="px-6 py-3">Kendaraan</th>
                  <th scope="col" className="px-6 py-3">Plat Nomor</th>
                  <th scope="col" className="px-6 py-3">Tanggal</th>
                  <th scope="col" className="px-6 py-3">Waktu</th>
                  <th scope="col" className="px-6 py-3">Tujuan</th>
                  <th scope="col" className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {latestRequests.length > 0 ? latestRequests.map((request) => (
                  <tr key={request.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {request.user.name}
                    </td>
                    <td className="px-6 py-4">{request.vehicle.name}</td>
                    <td className="px-6 py-4">{request.vehicle.plate}</td>
                    <td className="px-6 py-4">{dayjs(request.startDateTime).format("DD-MM-YYYY")}</td>
                    <td className="px-6 py-4">{dayjs(request.startDateTime).format("HH:mm")} - {dayjs(request.endDateTime).format("HH:mm")}</td>
                    <td className="px-6 py-4">{request.destination}</td>
                    <td className="px-6 py-4">
                      <Button 
                        color="blue" 
                        size="sm" 
                        pill
                        onClick={() => handleActionClick(request)}
                      >
                        Tindakan
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="text-center">
                      Tidak ada pengajuan terbaru
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="space-y-4 mt-10">
        <h2 className="text-2xl font-bold text-gray-900">KENDARAAN KELUAR HARI INI</h2>
        <Card className="w-full">
          <div className="overflow-x-auto">
            <Table striped className="w-full text-sm text-left text-gray-500">
              <TableHead className="text-xs text-gray-700 uppercase bg-gray-50">
                <TableRow>
                  <TableHeadCell scope="col" className="px-6 py-3">Nama</TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">Kendaraan</TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">Plat Nomor</TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">Waktu</TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">Tujuan</TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3"></TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {todayActivity.length > 0 ? todayActivity.map((request) => (
                  <TableRow key={request.id} className="bg-white  hover:bg-gray-200">
                    <TableCell className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {request.user.name}
                    </TableCell>
                    <TableCell className="px-6 py-4">{request.vehicle.name}</TableCell>
                    <TableCell className="px-6 py-4">{request.vehicle.plate}</TableCell>
                    <TableCell className="px-6 py-4">{dayjs(request.startDateTime).format("HH:mm")} - {dayjs(request.endDateTime).format("HH:mm")}</TableCell>
                    <TableCell className="px-6 py-4 w-sm">{request.destination}</TableCell>
                    <TableCell className="px-6 py-4 min-w-40">
                     <Image src={request.vehicle.image || "/default-car.png"} alt="Kendaraan" width={200} height={100} />
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Tidak ada kendaraan keluar hari ini
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Custom Confirmation Modal */}
      {showModal && (
       <ConfirmationModal
        handleCancel={handleCancel}
        handleApprove={handleApprove}
        handleRejectApi={handleRejectApi}
        selectedRequest={selectedRequest as RequestData}
       />
      )}

      {isLoading && <Loading type="full" />}
    </div>
  );
}