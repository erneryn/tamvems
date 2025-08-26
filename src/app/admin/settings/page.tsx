'use client';

import { Card } from "flowbite-react";
import { HiCog } from "react-icons/hi";

export default function AdminSettings() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <HiCog className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
      </div>
      
      <Card className="w-full">
        <div className="text-center py-12">
          <HiCog className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Halaman Pengaturan
          </h2>
          <p className="text-gray-500">
            Halaman ini akan menampilkan berbagai pengaturan sistem
          </p>
        </div>
      </Card>
    </div>
  );
} 