import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const returnVehicleSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = returnVehicleSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { 
          error: 'Data tidak valid',
          details: validatedData.error.issues.map(issue => ({
            field: issue.path[0],
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    const { requestId } = validatedData.data;

    // Get the vehicle request to verify ownership and status
    const vehicleRequest = await db.vehicleRequest.findUnique({
      where: { id: requestId },
      include: {
        vehicle: {
          select: {
            name: true,
            plate: true,
          }
        }
      }
    });

    if (!vehicleRequest) {
      return NextResponse.json(
        { error: 'Pengajuan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verify the request belongs to the current user
    if (vehicleRequest.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses untuk mengembalikan kendaraan ini' },
        { status: 403 }
      );
    }

    // Verify the request is approved and not already returned
    if (vehicleRequest.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Pengajuan harus dalam status disetujui untuk dapat dikembalikan' },
        { status: 400 }
      );
    }

    if (vehicleRequest.checkOutAt) {
      return NextResponse.json(
        { error: 'Kendaraan sudah dikembalikan sebelumnya' },
        { status: 400 }
      );
    }

    // Update the request status to COMPLETED and set check_out_at
    const updatedRequest = await db.vehicleRequest.update({
      where: { id: requestId },
      data: {
        status: 'COMPLETED',
        checkOutAt: new Date(),
      },
      include: {
        vehicle: {
          select: {
            name: true,
            plate: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Kendaraan ${updatedRequest.vehicle.plate} berhasil dikembalikan`,
      data: {
        id: updatedRequest.id,
        vehicleName: updatedRequest.vehicle.name,
        vehiclePlate: updatedRequest.vehicle.plate,
        checkOutAt: updatedRequest.checkOutAt,
        status: updatedRequest.status,
      }
    });

  } catch (error) {
    console.error('Vehicle return error:', error);
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
