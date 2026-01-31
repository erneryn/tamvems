import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { z } from "zod";
import { RequestStatus, VehicleType } from "@prisma/client";
import  dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { v2 as cloudinary } from 'cloudinary';

dayjs.extend(utc);
dayjs.extend(timezone);

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Constants for file upload
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const requestSchema = z.object({
  vehicleId: z.string(),
  destination: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
})

// Handle document file upload to Cloudinary
async function handleDocumentUpload(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Tipe file tidak valid. Tipe yang diizinkan: PDF, JPEG, PNG');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Ukuran file terlalu besar. Maksimal: 5MB');
  }

  const fileBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(fileBuffer);
  
  const base64String = buffer.toString('base64');
  const dataURI = `data:${file.type};base64,${base64String}`;

  // Use 'raw' for PDFs, 'image' for images
  // PDFs need resource_type 'raw' to be viewable in browser
  const isPdf = file.type === 'application/pdf';
  const resourceType = isPdf ? 'raw' : 'image';

  const uploadResponse = await cloudinary.uploader.upload(dataURI, {
    folder: 'mobildinas/surattugas',
    resource_type: resourceType,
    public_id: `surattugas-${Date.now()}`,
  });

  return uploadResponse.secure_url;
}


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
  description?: string | null;
  image: string | null;
  isActive: boolean;
  isAvailable: boolean;
  bookings: {
    startDateTime: string;
    endDateTime: string;
  }[];
  isOverlapping?: boolean;
  pendingCount: number;
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
      const startDateTime = dayjs(`${startDate} ${startTime}:00`).toDate();
      const endDateTime = dayjs(`${startDate} ${endTime}:00`).toDate();

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
        // userId: session.user.id,
      },
    });

    // Build pending count filter with same time overlap logic
    const pendingFilter: VehicleRequestFilter = {
      status: 'PENDING',
      deletedAt: null,
    };

    if (startDate && startTime && endTime) {
      const startDateTime = dayjs(`${startDate} ${startTime}:00`).toDate();
      const endDateTime = dayjs(`${startDate} ${endTime}:00`).toDate();

      pendingFilter.AND = [
        { startDateTime: { lt: endDateTime } },
        { endDateTime: { gt: startDateTime } },
      ];
    }

    const pendingRequests = await db.vehicleRequest.findMany({
      where: pendingFilter,
      select: {
        vehicleId: true,
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
        pendingCount: 0,
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

      // Count pending requests for this vehicle
      statusData.pendingCount = pendingRequests.filter((request) => request.vehicleId === vehicle.id).length;
      
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
    // Parse FormData instead of JSON
    const formData = await request.formData();
    
    const vehicleId = formData.get('vehicleId') as string;
    const destination = formData.get('destination') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const document = formData.get('document') as File | null;

    const validatedData = requestSchema.safeParse({
      vehicleId,
      destination,
      startDate,
      endDate,
      startTime,
      endTime,
    });

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
          gte: dayjs().startOf('day').toDate(),
          lte: dayjs().endOf('day').toDate(),
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

    // Document is mandatory
    if (!document || !(document instanceof File) || document.size === 0) {
      return NextResponse.json({ error: "Dokumen Surat Tugas wajib diunggah (PDF atau gambar)." }, { status: 400 });
    }

    // Upload document to Cloudinary
    let documentUrl: string | null = null;
    try {
      documentUrl = await handleDocumentUpload(document);
    } catch (uploadError) {
      if (uploadError instanceof Error) {
        return NextResponse.json({ error: uploadError.message }, { status: 400 });
      }
    }

    
    // Parse input times as Jakarta timezone (UTC+7) and convert to UTC
    // Example: Input 09:00 Jakarta time -> Output 02:00 UTC (09 - 7 = 02)
    const startDateTime = dayjs.tz(`${startDate} ${startTime}:00`, 'YYYY-MM-DD HH:mm:ss', 'Asia/Jakarta').utc().toDate();
    const endDateTime = dayjs.tz(`${endDate} ${endTime}:00`, 'YYYY-MM-DD HH:mm:ss', 'Asia/Jakarta').utc().toDate();
    
    const newVehicleRequest = await db.vehicleRequest.create({
      data: {
        vehicleId,
        destination,
        startDateTime,
        endDateTime,
        userId: session.user.id,
        createdById: session.user.id,
        status: 'PENDING',
        documentUrl,
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
        documentUrl: true,
        createdAt: true,
      }
    })

    return NextResponse.json(newVehicleRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle request:", error);
    return NextResponse.json({ error: "Failed to create vehicle request" }, { status: 500 });
  }
}
