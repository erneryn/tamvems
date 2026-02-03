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
  HiKey,
  HiLockClosed,
  HiLockOpen,
  HiExclamationCircle,
  HiPlus,
  HiIdentification,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

interface User {
  id: string;
  email: string;
  name: string;
  employeeId: string;
  phone: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  division: string;
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
  const { locale } = useLanguage();
  const t = translations[locale].admin.users;
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

  // Modal state for user modification (deactivate/delete)
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'deactivate' | 'delete' | null>(null);
  const [selectedActionUser, setSelectedActionUser] = useState<User | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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
        setError(err instanceof Error ? err.message : "Failed to load users");
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

  // Handle opening action modal
  const handleActionClick = (user: User, action: 'deactivate' | 'delete') => {
    setSelectedActionUser(user);
    setActionType(action);
    setShowActionModal(true);
    setActionError(null);
  };

  // Handle closing action modal
  const handleCloseActionModal = () => {
    setShowActionModal(false);
    setSelectedActionUser(null);
    setActionType(null);
    setActionError(null);
    setIsProcessingAction(false);
  };

  // Handle user modification action
  const handleUserAction = async () => {
    if (!selectedActionUser || !actionType) {
      setActionError(t.dataIncomplete);
      return;
    }

    setIsProcessingAction(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/admin/user/${selectedActionUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: actionType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${actionType} user`);
      }

      // Update the user in the list
      setUsers((prevUsers) => {
        if(actionType === 'deactivate') {
          return prevUsers.map((user) => {
            if(user.id === selectedActionUser.id) {
              return { ...user, isActive: data.user.isActive, updatedAt: data.user.updatedAt };
            }
            return user;
          });
        }

        if(actionType === 'delete') {
          return prevUsers.filter((user) => {
            if(user.id === selectedActionUser.id) {
              return user.id !== selectedActionUser.id;
            }
            return true;
          });
        }

        return prevUsers;
      }
      );

      // Show success message
      setError(data.message);
      setTimeout(() => setError(null), 3000);
      handleCloseActionModal();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : `Failed to ${actionType} user`
      );
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handle updating password permission
  const handleUpdatePasswordPermission = async () => {
    if (!selectedUser || !secretKey.trim()) {
      setModalError(t.secretKeyRequired);
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
          defaultPassword: secretKey.trim(),
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
            ? {
                ...user,
                enablePasswordChanges: data.user.enablePasswordChanges,
              }
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
        err instanceof Error
          ? err.message
          : "Failed to update password permission"
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
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
      </div>

      {/* Success/Error Message */}
      {error && (
        <Alert
          color={
            error.includes("berhasil") ||
            error.includes("success") ||
            error.includes("diaktifkan") ||
            error.includes("dinonaktifkan") ||
            error.includes("activated") ||
            error.includes("deactivated")
              ? "success"
              : "failure"
          }
          className="mb-4"
        >
          {error.includes("berhasil") ||
          error.includes("success") ||
          error.includes("diaktifkan") ||
          error.includes("dinonaktifkan") ||
          error.includes("activated") ||
          error.includes("deactivated") ? (
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
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Stats Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <p className="text-sm text-blue-600">{t.totalUsers}</p>
            <p className="text-2xl font-bold text-blue-700">{users.length}</p>
          </div>

          {/* Add User Button */}
          <Button href="/admin/register" className="shrink-0">
            <HiPlus className="h-4 w-4 mr-2" />
            {t.addUser}
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
                    {t.name}
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    {t.email}
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    {t.employeeId}
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    {t.phone}
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    {t.vehicleRequests}
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    {t.status}
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    {t.changePassword}
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    {t.actions}
                  </TableHeadCell>
                  <TableHeadCell scope="col" className="px-6 py-3">
                    {t.joined}
                  </TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y">
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-10 text-gray-500"
                    >
                      {searchTerm
                        ? t.noUsersSearch
                        : t.noUsersYet}
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
                        <div className="flex items-center space-x-2">
                          <HiOutlineUserGroup className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-mono">
                            {user.division}
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
                            {t.noPhone}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user._count.vehicleRequests} {t.requestsCount}
                          </span>
                          {user._count.createdRequests > 0 && (
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {user._count.createdRequests} {t.createdCount}
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
                              {t.active}
                            </>
                          ) : (
                            t.inactive
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center space-y-2">
                          <Badge
                            color={
                              user.enablePasswordChanges ? "success" : "warning"
                            }
                            className="flex items-center justify-center"
                          >
                            {user.enablePasswordChanges ? (
                              <>
                                <HiLockOpen className="mr-1 h-3 w-3" />
                                {t.allowed}
                              </>
                            ) : (
                              <>
                                <HiLockClosed className="mr-1 h-3 w-3" />
                                {t.blocked}
                              </>
                            )}
                          </Badge>
                          <Button
                            size="xs"
                            color={
                              user.enablePasswordChanges ? "failure" : "success"
                            }
                            onClick={() => handlePasswordPermissionClick(user)}
                            className="text-xs"
                          >
                            <HiKey className="mr-1 h-3 w-3" />
                            {user.enablePasswordChanges ? t.block : t.allow}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center space-y-2">
                          {user.isActive ? (
                            <Button
                              size="xs"
                              color="warning"
                              onClick={() => handleActionClick(user, 'deactivate')}
                              className="text-xs w-full"
                            >
                              <HiXCircle className="mr-1 h-3 w-3" />
                              {t.confirmDeactivate.replace(" Pengguna", "")}
                            </Button>
                          ) : (
                            <Button
                              size="xs"
                              color="failure"
                              onClick={() => handleActionClick(user, 'delete')}
                              className="text-xs w-full"
                            >
                              <HiXCircle className="mr-1 h-3 w-3" />
                              {t.confirmDelete.replace(" Pengguna", "")}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString(
                              locale === "id" ? "id-ID" : "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(user.createdAt).toLocaleTimeString(
                            locale === "id" ? "id-ID" : "en-GB",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
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
                ? t.blockPasswordChange
                : t.allowPasswordChange}
            </span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <HiExclamationCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800">
                  <strong>{t.warning}</strong> {t.passwordChangeWarningYouWill}{" "}
                  {selectedUser?.enablePasswordChanges ? t.passwordChangeWarningBlockVerb : t.passwordChangeWarningAllowVerb}{" "}
                  <span className="font-medium">{selectedUser?.name}</span>{" "}
                  {t.passwordChangeWarningToChangePassword}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  {t.thisActionRequiresDefaultPassword}
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
              <Label
                htmlFor="secretKey"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t.defaultPassword} <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id="secretKey"
                type="password"
                placeholder={t.enterDefaultPassword}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                disabled={isUpdating}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {t.useDefaultPasswordHint}
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={handleCloseModal} disabled={isUpdating}>
            {t.cancel}
          </Button>
          <Button
            color={selectedUser?.enablePasswordChanges ? "failure" : "success"}
            onClick={handleUpdatePasswordPermission}
            disabled={isUpdating || !secretKey.trim()}
          >
            {isUpdating ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {t.processing}
              </>
            ) : (
              <>
                <HiKey className="h-4 w-4 mr-2" />
                {selectedUser?.enablePasswordChanges
                  ? t.blockPassword
                  : t.allowPassword}
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* User Action Confirmation Modal */}
      <Modal show={showActionModal} onClose={handleCloseActionModal}>
        <ModalHeader>
          <div className="flex items-center space-x-2">
            <HiExclamationCircle className="h-6 w-6 text-red-500" />
            <span>
              {actionType === 'deactivate'
                ? t.confirmDeactivate
                : t.confirmDelete}
            </span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <HiExclamationCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm text-red-800">
                  <strong>{t.warning}</strong> {t.actionModalYouWill}{" "}
                  {actionType === "deactivate" ? t.deactivating : t.deleting}{" "}
                  {t.userLabel} <span className="font-medium">{selectedActionUser?.name}</span>.
                </p>
                {actionType === "deactivate" ? (
                  <p className="text-xs text-red-700 mt-1">
                    {t.deactivatedUserCannotLogin}
                  </p>
                ) : (
                  <p className="text-xs text-red-700 mt-1">
                    {t.deletePermanentWarning}
                  </p>
                )}
              </div>
            </div>

            {actionError && (
              <Alert color="failure">
                <HiXCircle className="h-4 w-4 mr-2" />
                {actionError}
              </Alert>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">{t.userDetails}</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">{t.nameColon}</span>
                  <span className="ml-2 font-medium">{selectedActionUser?.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t.emailColon}</span>
                  <span className="ml-2 font-medium">{selectedActionUser?.email}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t.nipColon}</span>
                  <span className="ml-2 font-medium">{selectedActionUser?.employeeId}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t.statusColon}</span>
                  <span className={`ml-2 font-medium ${
                    selectedActionUser?.isActive ? "text-green-600" : "text-red-600"
                  }`}>
                    {selectedActionUser?.isActive ? t.active : t.inactive}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={handleCloseActionModal} disabled={isProcessingAction}>
            {t.cancel}
          </Button>
          <Button
            color={actionType === 'deactivate' ? 'warning' : 'failure'}
            onClick={handleUserAction}
            disabled={isProcessingAction}
          >
            {isProcessingAction ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {t.processing}
              </>
            ) : (
              <>
                <HiXCircle className="h-4 w-4 mr-2" />
                {actionType === "deactivate" ? t.confirmDeactivate.replace(" Pengguna", "") : t.confirmDelete.replace(" Pengguna", "")}
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
    <Suspense
      fallback={
        <div className="flex justify-center items-center p-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <AdminUsersContent />
    </Suspense>
  );
}
