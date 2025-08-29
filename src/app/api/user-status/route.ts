import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export interface UserVehicleStatus {
  isUsingVehicle: boolean;
  isOverlapping: boolean;
  currentUsage?: {
    id: string;
    vehicleName: string;
    vehiclePlate: string;
    startDateTime: string;
    endDateTime: string;
    destination: string;
  };
  overdueUsage?: {
    id: string;
    vehicleName: string;
    vehiclePlate: string;
    startDateTime: string;
    endDateTime: string;
    destination: string;
    minutesOverdue: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = dayjs();

    // Get user's approved requests that haven't been checked out
    const approvedRequests = await db.vehicleRequest.findMany({
      where: {
        userId: session.user.id,
        status: 'APPROVED',
        checkOutAt: null, // Not checked out yet
      },
      include: {
        vehicle: {
          select: {
            name: true,
            plate: true,
          }
        }
      },
      orderBy: {
        startDateTime: 'asc'
      }
    });

    let isUsingVehicle = false;
    let isOverlapping = false;
    let currentUsage = undefined;
    let overdueUsage = undefined;

    for (const request of approvedRequests) {
      const startTime = dayjs(request.startDateTime);
      const endTime = dayjs(request.endDateTime);

      // Check if currently within usage time (start_date_time <= now <= end_date_time)
      if (now.isAfter(startTime) && now.isBefore(endTime)) {
        isUsingVehicle = true;
        currentUsage = {
          id: request.id,
          vehicleName: request.vehicle.name,
          vehiclePlate: request.vehicle.plate,
          startDateTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
          endDateTime: endTime.format('YYYY-MM-DD HH:mm:ss'),
          destination: request.destination,
        };
        break; // Found current usage, no need to check others
      }

      // Check if overdue (now >= end_date_time but not checked out)
      if (now.isAfter(endTime)) {
        isOverlapping = true;
        const minutesOverdue = now.diff(endTime, 'minute');
        
        overdueUsage = {
          id: request.id,
          vehicleName: request.vehicle.name,
          vehiclePlate: request.vehicle.plate,
          startDateTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
          endDateTime: endTime.format('YYYY-MM-DD HH:mm:ss'),
          destination: request.destination,
          minutesOverdue,
        };
        break; // Found overdue usage, no need to check others
      }
    }

    const response: UserVehicleStatus = {
      isUsingVehicle,
      isOverlapping,
      currentUsage,
      overdueUsage,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Get user vehicle status error:', error);
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST() {
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
