"use client";

import { useState, useEffect, Suspense } from "react";
import {
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
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  Alert,
} from "flowbite-react";

import {
  HiUsers,
  HiSearch,
  HiCheckCircle,
  HiXCircle,
  HiMail,
  HiPhone,
  HiIdentification,
  HiKey,
  HiLockClosed,
  HiLockOpen,
  HiExclamationCircle,
  HiPlus,
} from "react-icons/hi";

interface User {
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

function AdminUsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal state for password change permission
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [secretKey, setSecretKey] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load users"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm))
  );

  // Handle opening password change modal
  const handlePasswordPermissionClick = (user: User) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
    setSecretKey("");
    setModalError(null);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setSelectedUser(null);
    setSecretKey("");
    setModalError(null);
    setIsUpdating(false);
  };

  // Handle updating password permission
  const handleUpdatePasswordPermission = async () => {
    if (!selectedUser || !secretKey.trim()) {
      setModalError("Secret key harus diisi");
      return;
    }

    setIsUpdating(true);
    setModalError(null);

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enablePasswordChanges: !selectedUser.enablePasswordChanges,
          secretKey: secretKey.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password permission");
      }

      // Update the user in the list
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id
            ? { ...user, enablePasswordChanges: data.user.enablePasswordChanges }
            : user
        )
      );

      // Show success message
      setError(null);
      handleCloseModal();
      
      // Show temporary success message
      const successMessage = data.message;
      setError(successMessage);
      setTimeout(() => setError(null), 3000);

    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Failed to update password permission"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <HiUsers className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Kelola Pengguna</h1>
      </div>

      {/* Success/Error Message */}
      {error && (
        <Alert 
          color={error.includes('berhasil') || error.includes('diaktifkan') || error.includes('dinonaktifkan') ? "success" : "failure"}
          className="mb-4"
        >
          {error.includes('berhasil') || error.includes('diaktifkan') || error.includes('dinonaktifkan') ? (
            <HiCheckCircle className="h-5 w-5 mr-3" />
          ) : (
            <HiXCircle className="h-5 w-5 mr-3" />
          )}
          {error}
        </Alert>
      )}

      {/* Actions Bar */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 max-w-md">
          <TextInput
            type="text"
            icon={HiSearch}
            placeholder="Cari pengguna..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4">
          {/* Stats Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <p className="text-sm text-blue-600">Total Pengguna</p>
            <p className="text-2xl font-bold text-blue-700">{users.length}</p>
          </div>
          
          {/* Add User Button */}
          <Button href="/admin/register" className="shrink-0">
            <HiPlus className="h-4 w-4 mr-2" />
            Tambah Pengguna
          </Button>
        </div>
      </div>

      {/* Users Table */}
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
                  <TableHeadCell scope="col" className="px-6 py-3">
                    Nama
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    Email
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    ID Karyawan
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    Telepon
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    Permintaan Kendaraan
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    Status
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    Ubah Password
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    Bergabung
                  </TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y">
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-10 text-gray-500"
                    >
                      {searchTerm
                        ? "Tidak ada pengguna yang sesuai dengan pencarian"
                        : "Belum ada pengguna terdaftar"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="bg-white">
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <HiMail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <HiIdentification className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-mono">
                            {user.employeeId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.phone ? (
                          <div className="flex items-center space-x-2">
                            <HiPhone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {user.phone}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Tidak ada
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user._count.vehicleRequests} permintaan
                          </span>
                          {user._count.createdRequests > 0 && (
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {user._count.createdRequests} dibuat
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          color={user.isActive ? "success" : "gray"} 
                          className="flex items-center justify-center"
                        >
                          {user.isActive ? (
                            <>
                              <HiCheckCircle className="mr-1 h-3 w-3" />
                              Aktif
                            </>
                          ) : (
                            "Nonaktif"
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center space-y-2">
                          <Badge 
                            color={user.enablePasswordChanges ? "success" : "warning"}
                            className="flex items-center justify-center"
                          >
                            {user.enablePasswordChanges ? (
                              <>
                                <HiLockOpen className="mr-1 h-3 w-3" />
                                Diizinkan
                              </>
                            ) : (
                              <>
                                <HiLockClosed className="mr-1 h-3 w-3" />
                                Diblokir
                              </>
                            )}
                          </Badge>
                          <Button
                            size="xs"
                            color={user.enablePasswordChanges ? "failure" : "success"}
                            onClick={() => handlePasswordPermissionClick(user)}
                            className="text-xs"
                          >
                            <HiKey className="mr-1 h-3 w-3" />
                            {user.enablePasswordChanges ? "Blokir" : "Izinkan"}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(user.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>



      {/* Password Permission Modal */}
      <Modal show={showPasswordModal} onClose={handleCloseModal}>
        <ModalHeader>
          <div className="flex items-center space-x-2">
            <HiKey className="h-6 w-6 text-blue-500" />
            <span>
              {selectedUser?.enablePasswordChanges 
                ? "Blokir Perubahan Password" 
                : "Izinkan Perubahan Password"}
            </span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <HiExclamationCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800">
                  <strong>Peringatan:</strong> Anda akan {selectedUser?.enablePasswordChanges ? "memblokir" : "mengizinkan"} {" "}
                  <span className="font-medium">{selectedUser?.name}</span> untuk mengubah password mereka.
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Tindakan ini memerlukan konfirmasi dengan secret key admin.
                </p>
              </div>
            </div>

            {modalError && (
              <Alert color="failure">
                <HiXCircle className="h-4 w-4 mr-2" />
                {modalError}
              </Alert>
            )}

            <div>
              <Label htmlFor="secretKey" className="block text-sm font-medium text-gray-700 mb-2">
                Secret Key Admin <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id="secretKey"
                type="password"
                placeholder="Masukkan secret key admin"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                disabled={isUpdating}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Gunakan secret key yang sama seperti saat mendaftarkan admin
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="gray"
            onClick={handleCloseModal}
            disabled={isUpdating}
          >
            Batal
          </Button>
          <Button
            color={selectedUser?.enablePasswordChanges ? "failure" : "success"}
            onClick={handleUpdatePasswordPermission}
            disabled={isUpdating || !secretKey.trim()}
          >
            {isUpdating ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Memproses...
              </>
            ) : (
              <>
                <HiKey className="h-4 w-4 mr-2" />
                {selectedUser?.enablePasswordChanges ? "Blokir" : "Izinkan"} Password
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default function AdminUsers() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AdminUsersContent />
    </Suspense>
  );
}
