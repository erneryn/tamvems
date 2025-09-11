import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is admin or super admin
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build filter for date range
    const filter: {
      isActive: boolean;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {
      isActive: true,
    };

    if (startDate && endDate) {
      filter.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59.999Z'), // Include the entire end date
      };
    } else if (startDate) {
      filter.createdAt = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      filter.createdAt = {
        lte: new Date(endDate + 'T23:59:59.999Z'),
      };
    }

    // Fetch vehicle requests with related data
    const vehicleRequests = await db.vehicleRequest.findMany({
      where: filter,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            employeeId: true,
            division: true,
          },
        },
        vehicle: {
          select: {
            name: true,
            plate: true,
            type: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
            employeeId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data for Excel export
    const excelData = vehicleRequests.map((request, index) => ({
      'No': index + 1,
      'ID Pengajuan': request.id,
      'Nama Pemohon': request.user.name,
      'NIP Pemohon': request.user.employeeId,
      'Email Pemohon': request.user.email,
      'Divisi': request.user.division,
      'Nama Kendaraan': request.vehicle.name,
      'Plat Nomor': request.vehicle.plate,
      'Jenis Kendaraan': request.vehicle.type,
      'Tujuan': request.destination,
      'Tanggal Mulai': dayjs(request.startDateTime).format('DD/MM/YYYY'),
      'Waktu Mulai': dayjs(request.startDateTime).format('HH:mm'),
      'Tanggal Selesai': dayjs(request.endDateTime).format('DD/MM/YYYY'),
      'Waktu Selesai': dayjs(request.endDateTime).format('HH:mm'),
      'Status': request.status,
      'Tanggal Disetujui': request.approvedAt ? dayjs(request.approvedAt).format('DD/MM/YYYY HH:mm') : '-',
      'Tanggal Ditolak': request.rejectedAt ? dayjs(request.rejectedAt).format('DD/MM/YYYY HH:mm') : '-',
      'Alasan Penolakan': request.rejectionReason || '-',
      'Tanggal Check Out': request.checkOutAt ? dayjs(request.checkOutAt).format('DD/MM/YYYY HH:mm') : '-',
      'Dibuat Oleh': request.createdBy.name,
      'NIP Pembuat': request.createdBy.employeeId,
      'Tanggal Dibuat': dayjs(request.createdAt).format('DD/MM/YYYY HH:mm'),
      'Terakhir Diupdate': dayjs(request.updatedAt).format('DD/MM/YYYY HH:mm'),
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 5 },   // No
      { wch: 25 },  // ID Pengajuan
      { wch: 20 },  // Nama Pemohon
      { wch: 15 },  // NIP Pemohon
      { wch: 25 },  // Email Pemohon
      { wch: 8 },   // Divisi
      { wch: 20 },  // Nama Kendaraan
      { wch: 12 },  // Plat Nomor
      { wch: 12 },  // Jenis Kendaraan
      { wch: 30 },  // Tujuan
      { wch: 12 },  // Tanggal Mulai
      { wch: 10 },  // Waktu Mulai
      { wch: 12 },  // Tanggal Selesai
      { wch: 10 },  // Waktu Selesai
      { wch: 12 },  // Status
      { wch: 18 },  // Tanggal Disetujui
      { wch: 18 },  // Tanggal Ditolak
      { wch: 25 },  // Alasan Penolakan
      { wch: 18 },  // Tanggal Check Out
      { wch: 20 },  // Dibuat Oleh
      { wch: 15 },  // NIP Pembuat
      { wch: 18 },  // Tanggal Dibuat
      { wch: 18 },  // Terakhir Diupdate
    ];

    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Pengajuan Kendaraan");

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx'
    });

    // Create filename with timestamp and date range
    const timestamp = dayjs().format('YYYYMMDD_HHmmss');
    let filename = `laporan_pengajuan_kendaraan_${timestamp}`;
    
    if (startDate && endDate) {
      filename += `_${startDate}_to_${endDate}`;
    } else if (startDate) {
      filename += `_from_${startDate}`;
    } else if (endDate) {
      filename += `_until_${endDate}`;
    }
    
    filename += '.xlsx';

    // Return the Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("Error exporting vehicle requests:", error);
    return NextResponse.json(
      { error: "Failed to export vehicle requests" },
      { status: 500 }
    );
  }
}
