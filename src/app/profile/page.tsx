"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button, Card, Label, TextInput, Select, Alert } from "flowbite-react";
import { HiUser, HiMail, HiPhone, HiKey, HiEye, HiEyeOff } from "react-icons/hi";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  employeeId?: string;
  phone: string | null;
  role: string;
  division: string;
  enablePasswordChanges: boolean;
}

export default function Profile() {
  const { data: session, status } = useSession();
  const { locale } = useLanguage();
  const t = translations[locale].profile;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    division: ""
  });
  
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/profile`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          name: data.name,
          phone: data.phone || "",
          division: data.division
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setAlert({ type: 'error', message: t.loadError });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false);
        setAlert({ type: 'success', message: t.updateSuccess });
      } else {
        const error = await response.json();
        setAlert({ type: 'error', message: error.error || t.updateError });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setAlert({ type: 'error', message: t.serverError });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlert({ type: 'error', message: t.passwordMismatch });
      return;
    }

    if (passwordData.newPassword.length < 5) {
      setAlert({ type: 'error', message: t.passwordMinLength });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordData({ newPassword: "", confirmPassword: "" });
        setAlert({ type: 'success', message: t.passwordUpdateSuccess });
      } else {
        const error = await response.json();
        setAlert({ type: 'error', message: error.error || t.passwordUpdateError });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setAlert({ type: 'error', message: t.serverError });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t.loginRequired}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {alert && (
        <Alert
          color={alert.type === 'success' ? 'success' : 'failure'}
          onDismiss={() => setAlert(null)}
          className="mb-6"
        >
          {alert.message}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information Card */}
        <Card className="h-fit">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{t.profileInfo}</h2>
            <Button
              color="light"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              disabled={loading}
            >
              {isEditing ? translations[locale].common.cancel : t.editProfile}
            </Button>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <Label htmlFor="email">{t.email}</Label>
              <TextInput
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                icon={HiMail}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">{t.emailCannotChange}</p>
            </div>


            <div>
              <Label htmlFor="name">{t.name}</Label>
              <TextInput
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                disabled={!isEditing}
                icon={HiUser}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">{t.phone}</Label>
              <TextInput
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={!isEditing}
                icon={HiPhone}
                className="mt-1"
                placeholder={t.phonePlaceholder}
              />
            </div>

            <div>
              <Label htmlFor="division">{t.division}</Label>
              <Select
                id="division"
                value={formData.division}
                onChange={(e) => setFormData({...formData, division: e.target.value})}
                disabled={!isEditing}
                className="mt-1"
                required
              >
                <option value="A">Divisi A</option>
                <option value="B">Divisi B</option>
                <option value="C">Divisi C</option>
                <option value="D">Divisi D</option>
                <option value="E">Divisi E</option>
                <option value="F">Divisi F</option>
                <option value="G">Divisi G</option>
                <option value="H">Divisi H</option>
                <option value="I">Divisi I</option>
                <option value="J">Divisi J</option>
                <option value="K">Divisi K</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <TextInput
                id="role"
                value={profile?.role || ''}
                disabled
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">{t.roleCannotChange}</p>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? t.saving : t.saveChanges}
                </Button>
                <Button
                  color="light"
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: profile?.name || '',
                      phone: profile?.phone || '',
                      division: profile?.division || ''
                    });
                  }}
                >
                  {translations[locale].common.cancel}
                </Button>
              </div>
            )}
          </form>
        </Card>

        {/* Password Change Card */}
        
        <Card className="h-fit">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{t.changePassword}</h2>
            {!profile?.enablePasswordChanges && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  {t.changePasswordNote}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">

            <div>
              <Label htmlFor="newPassword">{t.newPassword}</Label>
              <div className="relative mt-1">
                <TextInput
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  disabled={!profile?.enablePasswordChanges || loading}
                  icon={HiKey}
                  required
                  minLength={5}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">{t.minPasswordHint}</p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
              <TextInput
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                disabled={!profile?.enablePasswordChanges || loading}
                icon={HiKey}
                required
                className="mt-1"
              />
            </div>

            {profile?.enablePasswordChanges && (
              <Button
                type="submit"
                disabled={loading || !passwordData.newPassword || !passwordData.confirmPassword}
                className="w-full"
              >
                {loading ? t.changingPassword : t.updatePassword}
              </Button>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
