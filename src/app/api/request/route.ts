import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { z } from "zod";
import { RequestStatus, VehicleType } from "@prisma/client";
import  dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const requestSchema = z.object({
  vehicleId: z.string(),
  destination: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
})


interface VehicleRequestFilter {
  AND?: Array<{
    startDateTime?: {
      lt?: Date;
    };
    endDateTime?: {
      gt?: Date;
    }
  }>
  status?: RequestStatus;
  isActive?: boolean;
  deletedAt?: Date | null;
}

export interface VehicleResponse {
  id: string;
  name: string;
  plate: string;
  type: VehicleType;
  year: string;
  image: string | null;
  isActive: boolean;
  isAvailable: boolean;
  bookings: {
    startDateTime: string;
    endDateTime: string;
  }[];
  isOverlapping?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");

    // Build the query filter
    const filter: VehicleRequestFilter = {
      status: 'APPROVED',
      deletedAt: null,
    };

    if (startDate && startTime && endTime) {
      const startDateTime = dayjs.utc(`${startDate} ${startTime}:00`).toDate();
      const endDateTime = dayjs.utc(`${startDate} ${endTime}:00`).toDate();

      filter.AND = [
        {
          startDateTime: {
            lt: endDateTime,
          },
        },
        {
          endDateTime: {
            gt: startDateTime,
          },
        },
      ];

    }

    // Get vehicle requests with filters
    const approvedRequests = await db.vehicleRequest.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            name: true,
            plate: true,
            type: true,
          },
        },
        createdBy: {
          select: {
            id: true,
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

    console.log(approvedRequests);

    const vehicles = await db.vehicle.findMany({
      where: {
        isActive: true,
      },
    });

    const unCheckOutVehicle = await db.vehicleRequest.findMany({
      where: {
        status: 'APPROVED',
        checkOutAt: null,
        deletedAt: null,
      },
    });

    const vehicleResponse: VehicleResponse[] = vehicles.map((vehicle) => {
      const statusData = {
        isAvailable: true,
        bookings : [] as {
          startDateTime: string;
          endDateTime: string;
        }[],
        isOverlapping: false,
      }
      const unCheckOutVehicleRequest = unCheckOutVehicle.find((request) => request.vehicleId === vehicle.id);
    
      if(unCheckOutVehicleRequest) {
        statusData.isAvailable = false;
        statusData.bookings = [];
        statusData.isOverlapping = true;
      } else {
        const vehicleRequest = approvedRequests.filter((request) => request.vehicleId === vehicle.id);
        if(vehicleRequest.length > 0) {
          statusData.bookings = vehicleRequest.map((request) => ({
              startDateTime: dayjs(request.startDateTime).format("HH:mm"),
              endDateTime: dayjs(request.endDateTime).format("HH:mm"),
            }));
        }
      }
      return {
        ...vehicle,
        ...statusData,
      }
    })

    return NextResponse.json({ data: vehicleResponse }, { status: 200 });
  } catch (error) {
    console.error("Error fetching vehicle requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicle requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vehicleId, destination, startDate, endDate, startTime, endTime } = body
    const validatedData = requestSchema.safeParse(body)


    if (!validatedData.success) {
      return NextResponse.json({ error: "Invalid data", details: validatedData.error.issues }, { status: 400 });
    }

    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        division: true,
      },
    })

    const todayRequest = await db.vehicleRequest.findMany({
      where: {
        createdAt: {
          gte: dayjs.utc().startOf('day').toDate(),
          lte: dayjs.utc().endOf('day').toDate(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            division: true,
          },
        },
      },
    })


    const userDivisionRequest = todayRequest.filter((request) => request.user.division.toLowerCase() === user?.division?.toLowerCase())
    if(userDivisionRequest.length >= (process.env.MAX_REQUEST_PER_DAY ? parseInt(process.env.MAX_REQUEST_PER_DAY) : 2)) {
      return NextResponse.json({ error: "Maximum pengajuan per divisi hari ini sudah tercapai (2)", errorCode: "MAX_REQUEST_PER_DAY" }, { status: 400 });
    }

    
    const startDateTime = dayjs.utc(`${startDate} ${startTime}:00`).toDate();
    const endDateTime = dayjs.utc(`${endDate} ${endTime}:00`).toDate();

    const newVehicleRequest = await db.vehicleRequest.create({
      data: {
        vehicleId,
        destination,
        startDateTime,
        endDateTime,
        userId: session.user.id,
        createdById: session.user.id,
        status: 'PENDING',
      },
      select: {
        id: true,
        vehicleId: true,
        destination: true,
        startDateTime: true,
        endDateTime: true,
        userId: true,
        createdById: true,
        status: true,
        createdAt: true,
      }
    })

    return NextResponse.json(newVehicleRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle request:", error);
    return NextResponse.json({ error: "Failed to create vehicle request" }, { status: 500 });
  }
}
