'use client';

import { Button, Label, TextInput } from "flowbite-react";
import { HiMail, HiUser, HiIdentification, HiPhone, HiKey } from "react-icons/hi";
import { useState } from "react";

export default function Register() {
  const [password, setPassword] = useState("");

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

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl sm:text-5xl md:text-6xl text-gray-900 mb-6">
          Input Pengguna Baru
        </h1>
        <div className="border-b-2 border-gray-300 w-full"></div>
        <div className="mt-5 mb-10">
          <div className="max-w-2xl mx-auto">
            <div className="grid gap-6 mb-6">
              <div>
                <Label htmlFor="name">Nama Lengkap</Label>
                <TextInput
                  id="name"
                  type="text"
                  icon={HiUser}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <TextInput
                  id="email"
                  type="email"
                  icon={HiMail}
                  placeholder="nama@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="employeeId">Nomor Induk</Label>
                <TextInput
                  id="employeeId"
                  type="text"
                  icon={HiIdentification}
                  placeholder="Masukkan nomor induk"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Nomor Handphone</Label>
                <TextInput
                  id="phone"
                  type="tel"
                  icon={HiPhone}
                  placeholder="Masukkan nomor handphone"
                  required
                />
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
                  >
                    Generate Password
                  </Button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Password akan digenerate secara otomatis
                </p>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Daftar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
