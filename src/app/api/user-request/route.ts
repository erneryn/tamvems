import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import { VehicleRequest, Prisma } from "@prisma/client";
import { getDateRangeFilter } from "@/lib/filters";

export async function GET(request: NextRequest) {
  // Get the authenticated user session
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get query parameters for filtering
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const dateRange = searchParams.get("dateRange");
  const sortOrder = searchParams.get("sortOrder") || "desc";

  // Build where clause
  const where: Prisma.VehicleRequestWhereInput = {
    userId: session.user.id,
    deletedAt: null
  };

  // Add status filter if provided
  if (status) {
    where.status = status as Prisma.EnumRequestStatusFilter;
  }

  // Add date range filter if provided
  if (dateRange) {
    const dateFilter = getDateRangeFilter(dateRange);
    if (dateFilter) {
      where.startDateTime = dateFilter;
    }
  }

  const userRequest = await db.vehicleRequest.findMany({
    where,
    include: {
      vehicle: {
        select: {
          id: true,
          name: true,
          plate: true,
          image: true,
          description: true,
        },
      },
    },
    orderBy: {
      createdAt: sortOrder === "desc" ? "desc" : "asc",
    },
  });

  const approvedRequests = userRequest.filter(
    (request) => request.status === "APPROVED"
  );

  const unCheckOutVehicle = await db.vehicleRequest.findMany({
    where: {
      userId: {
        not: session.user.id,
      },
      status: "APPROVED",
      checkOutAt: null,
      vehicleId: {
        in: approvedRequests.map((request) => request.vehicleId),
      },
    },
  });

  const mapVehicleId = unCheckOutVehicle.map((vehicle) => vehicle.vehicleId); 

  const userRequestResponse = userRequest.map((request) => {
  
    return {
      ...request,
      buttonStatus: getButtonStatus(request),
      isIdle: !mapVehicleId.includes(request.vehicleId),
    };
  });

  return NextResponse.json(userRequestResponse);
}

const getButtonStatus = (request:VehicleRequest & {vehicle: {plate: string}}) => {
  const now = dayjs();
  
  if (request.status === "APPROVED") {
    if (request.checkOutAt === null) {      
      // check if same day 
     if(dayjs(now).isSame(dayjs(request.endDateTime), 'day')) {
      // check if current hour is before startDateTime
      if(dayjs(now).isBefore(dayjs(request.startDateTime))) {
        return null;
      }
      // check if current hour is after request hour
      if(dayjs(now).isAfter(dayjs(request.endDateTime))) {
        return "overTime";
      } 
      return "ontime";
     } else {
      return "warning";
     }
    }
  }
  return null;
};
