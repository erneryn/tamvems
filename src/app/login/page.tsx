"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Car, Shield, CheckCircle } from "lucide-react";
import { useActionState } from "react";
import { signInAction } from "@/lib/action";
import { ActionState } from "@/lib/action";

const initialState: ActionState = {
  success: false,
  error: null,
  data: { email: null, password: null },
}

export default function Login() {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state.success && state.redirectTo) {
      console.log("Login successful, session ready. Redirecting to:", state.redirectTo);
      window.location.href = state.redirectTo;
    }
  }, [state.success, state.redirectTo, isPending]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding and Features */}
        <div className="hidden lg:block space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
              <div className="bg-blue-600 p-3 rounded-xl">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">TamVems</h1>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tambora Vehicle
              <br />
              <span className="text-blue-600">Monitoring System</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Platform digital untuk mengelola kendaraan dinas dengan efisien dan transparan
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-700">Pencatatan kendaraan otomatis</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-700">Monitoring real-time ketersediaan</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-700">Laporan penggunaan detail</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-2 rounded-full">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-700">Keamanan data terjamin</span>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">TamVems</h1>
              </div>
              <p className="text-gray-600">Masuk ke sistem monitoring kendaraan</p>
            </div>

            <div className="hidden lg:block mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang</h3>
              <p className="text-gray-600">Masuk ke akun Anda untuk melanjutkan</p>
            </div>

            <form action={formAction} className="space-y-6">
              {state.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="text-sm">{state.error}</p>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email / Username
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Masukkan email atau username"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Masukkan password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Ingat saya</span>
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Lupa password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
              >
                {isPending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Memproses...</span>
                  </div>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Belum memiliki akun?{" "}
                <Link 
                  href="/register" 
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Ajukan Pendaftaran sekarang
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Dengan masuk, Anda menyetujui{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Syarat & Ketentuan
                </Link>{" "}
                dan{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Kebijakan Privasi
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Butuh bantuan?{" "}
              <Link 
                href="/contact" 
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Hubungi support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
