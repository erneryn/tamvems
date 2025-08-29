'use client';

import { 
  Button, 
  Label, 
  TextInput, 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Alert,
  Spinner,
  Select
} from "flowbite-react";
import { 
  HiMail, 
  HiUser, 
  HiIdentification, 
  HiPhone, 
  HiKey, 
  HiCheckCircle, 
  HiClipboard,
  HiExclamationCircle 
} from "react-icons/hi";
import { useState } from "react";

export default function Register() {
  const [password, setPassword] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employeeId: "",
    phone: "",
    division: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<{
    email: string;
    password: string;
    name: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const generatePassword = () => {
    const length = 5;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let newPassword = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      newPassword += charset[randomIndex];
    }
    setPassword(newPassword);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError("Silakan generate password terlebih dahulu");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          password,
          confirmPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if(data.details) {
          const message = data.details.map((detail: { message: string }) => detail?.message).join(', ');
          throw new Error(message);
        }
        throw new Error(data.error || 'Gagal mendaftarkan pengguna');
      }

      // Store registered user data for modal
      setRegisteredUser({
        email: formData.email,
        password: password,
        name: formData.name
      });

      // Show success modal
      setShowSuccessModal(true);

      // Reset form
      setFormData({
        name: "",
        email: "",
        employeeId: "",
        phone: "",
        division: "",
      });
      setPassword("");

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const closeModal = () => {
    setShowSuccessModal(false);
    setRegisteredUser(null);
    setCopiedField(null);
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl sm:text-5xl md:text-6xl text-gray-900 mb-6">
          Input Pengguna Baru
        </h1>
        <div className="border-b-2 border-gray-300 w-full"></div>
        
        {/* Error Message */}
        {error && (
          <Alert color="failure" className="mt-4">
            <div className="flex items-center">
              <HiExclamationCircle className="h-4 w-4 mr-2" />
              <span>{error}</span>
            </div>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="mt-5 mb-10">
          <div className="max-w-2xl mx-auto">
            <div className="grid gap-6 mb-6">
              <div>
                <Label htmlFor="name">Nama Lengkap</Label>
                <TextInput
                  id="name"
                  name="name"
                  type="text"
                  icon={HiUser}
                  placeholder="Masukkan nama lengkap"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  icon={HiMail}
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <Label htmlFor="employeeId">Nomor Induk</Label>
                <TextInput
                  id="employeeId"
                  name="employeeId"
                  type="text"
                  icon={HiIdentification}
                  placeholder="Masukkan nomor induk"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Nomor Handphone</Label>
                <TextInput
                  id="phone"
                  name="phone"
                  type="tel"
                  icon={HiPhone}
                  placeholder="Masukkan nomor handphone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <Label htmlFor="division">Divisi</Label>
                <Select
                  id="division"
                  name="division"
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  disabled={isLoading}
                  required
                >
                  <option value="">Pilih Divisi</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                  <option value="G">G</option>
                  <option value="H">H</option>
                  <option value="I">I</option>
                  <option value="J">J</option>
                  <option value="K">K</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="flex gap-2">
                  <TextInput
                    id="password"
                    type="text"
                    icon={HiKey}
                    readOnly
                    value={password}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    color="gray"
                    onClick={generatePassword}
                    disabled={isLoading}
                  >
                    Generate Password
                  </Button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Password akan digenerate secara otomatis
                </p>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !password}>
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Mendaftarkan...
                </>
              ) : (
                "Daftar"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onClose={closeModal}>
        <ModalHeader>
          <div className="flex items-center space-x-2">
            <HiCheckCircle className="h-6 w-6 text-green-500" />
            <span>Pengguna Berhasil Didaftarkan</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Important Warning */}
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <HiExclamationCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  ⚠️ PENTING: Password hanya ditampilkan sekali!
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Pastikan untuk menyimpan atau mencatat informasi login ini dengan aman. 
                  Password tidak akan ditampilkan lagi setelah modal ini ditutup.
                </p>
              </div>
            </div>

            {registeredUser && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Pengguna <span className="font-semibold">{registeredUser.name}</span> telah berhasil didaftarkan. 
                  Berikut adalah informasi login yang perlu diberikan kepada pengguna:
                </p>

                {/* Email */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <TextInput
                      value={registeredUser.email}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      color={copiedField === 'email' ? 'success' : 'gray'}
                      onClick={() => copyToClipboard(registeredUser.email, 'email')}
                    >
                      {copiedField === 'email' ? (
                        <>
                          <HiCheckCircle className="h-4 w-4 mr-1" />
                          Disalin
                        </>
                      ) : (
                        <>
                          <HiClipboard className="h-4 w-4 mr-1" />
                          Salin
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Password:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <TextInput
                      value={registeredUser.password}
                      readOnly
                      className="flex-1 font-mono"
                    />
                    <Button
                      size="sm"
                      color={copiedField === 'password' ? 'success' : 'gray'}
                      onClick={() => copyToClipboard(registeredUser.password, 'password')}
                    >
                      {copiedField === 'password' ? (
                        <>
                          <HiCheckCircle className="h-4 w-4 mr-1" />
                          Disalin
                        </>
                      ) : (
                        <>
                          <HiClipboard className="h-4 w-4 mr-1" />
                          Salin
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Security Note */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Catatan Keamanan:</strong>
                  </p>
                  <ul className="text-xs text-blue-700 mt-1 space-y-1">
                    <li>• Berikan informasi ini secara langsung kepada pengguna</li>
                    <li>• Jangan mengirim password melalui email atau pesan tidak aman</li>
                    <li>• Sarankan pengguna untuk mengubah password setelah login pertama</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={closeModal}>
            Tutup
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
