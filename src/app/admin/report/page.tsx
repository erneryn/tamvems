'use client';

import { useState } from "react";
import { Card, Button, Alert, Spinner } from "flowbite-react";
import { HiChartBar, HiDownload, HiCalendar } from "react-icons/hi";

export default function AdminReport() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setMessage(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/admin/export/vehicle-requests?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with date range
      const dateRange = startDate && endDate 
        ? `_${startDate}_to_${endDate}` 
        : startDate 
          ? `_from_${startDate}`
          : endDate 
            ? `_until_${endDate}`
            : '';
      
      link.download = `vehicle_requests_report${dateRange}.xlsx`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setMessage({
        type: 'success',
        text: 'Laporan berhasil diexport!'
      });

    } catch (error) {
      console.error('Export error:', error);
      setMessage({
        type: 'error',
        text: 'Gagal mengexport data. Silakan coba lagi.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const resetDates = () => {
    setStartDate('');
    setEndDate('');
    setMessage(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <HiChartBar className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Laporan Data</h1>
      </div>
      
      <Card className="w-full">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Export Data Pengajuan Kendaraan
            </h2>
            <p className="text-gray-600 mb-6">
              Download laporan data pengajuan kendaraan dalam format Excel. 
              Anda dapat memfilter berdasarkan rentang tanggal atau export semua data.
            </p>
          </div>

          {/* Date Range Selection */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
              <HiCalendar className="h-5 w-5 mr-2" />
              Filter Rentang Tanggal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={resetDates}
                color="light"
                size="sm"
              >
                Reset Filter
              </Button>
            </div>
          </div>

          {/* Export Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-700">
                  Export ke Excel
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {startDate || endDate 
                    ? `Export data dari ${startDate || 'awal'} sampai ${endDate || 'sekarang'}`
                    : 'Export semua data pengajuan kendaraan'
                  }
                </p>
              </div>
              
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center"
                color="blue"
              >
                {isExporting ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <HiDownload className="h-4 w-4 mr-2" />
                )}
                {isExporting ? 'Mengexport...' : 'Export Excel'}
              </Button>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <Alert 
              color={message.type === 'success' ? 'success' : 'failure'}
              onDismiss={() => setMessage(null)}
            >
              {message.text}
            </Alert>
          )}
        </div>
      </Card>

      {/* Information Card */}
      <Card className="w-full">
        <div className="text-center py-8">
          <HiChartBar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Data yang Akan Diexport
          </h3>
          <div className="text-sm text-gray-500 space-y-1">
            <p>• Data pengajuan kendaraan (ID, Pemohon, Kendaraan)</p>
            <p>• Detail waktu (Tanggal mulai, Tanggal selesai, Dibuat)</p>
            <p>• Status pengajuan (Pending, Approved, Rejected, dll)</p>
            <p>• Tujuan perjalanan dan informasi approval</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

