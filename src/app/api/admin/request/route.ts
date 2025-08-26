import { db } from "@/lib/db";
import { Prisma, RequestStatus } from "@prisma/client";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

interface VehicleRequestFilter {
  status?: RequestStatus;
  startDateTime?: {
    gte?: Date;
  };
  endDateTime?: {
    lt?: Date;
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || null;
  const limit = searchParams.get("limit") || null;
  const status = searchParams.get("status");
  const isToday = searchParams.get("isToday") || false;
  const isOverdue = searchParams.get("isOverdue") || false;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const filter: VehicleRequestFilter = {
    status : status as RequestStatus || undefined,
  }

  if(isToday) {
    const dateStart = dayjs().startOf("day").toDate();
    filter.startDateTime = {
      gte: dateStart,
    }
  }

  if(isOverdue) {
    const now = dayjs();
    filter.endDateTime = {
      lt: now.toDate(),
    }
  }

  // Create orderBy object dynamically
  const orderBy: Record<string, string> = {};
  orderBy[sortBy] = sortOrder;

  const requestOptions: Prisma.VehicleRequestFindManyArgs = {
    where: filter,
    include: {
      vehicle: true,
      user: true,
    },
    orderBy,
    skip: page ? (Number(page) - 1) * Number(limit) : undefined,
    take: limit ? Number(limit) : undefined,
  }

  // Get total count for pagination
  const totalCount = await db.vehicleRequest.count({
    where: filter,
  });
  
  const requests = await db.vehicleRequest.findMany(requestOptions);

  // Calculate pagination metadata
  const pageNumber = page ? Number(page) : 1;
  const limitNumber = limit ? Number(limit) : requests.length;
  const totalPages = Math.ceil(totalCount / limitNumber);

  return NextResponse.json({
    data: requests,
    pagination: {
      currentPage: pageNumber,
      totalPages,
      totalCount,
      limit: limitNumber,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
    }
  });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, status, rejectionReason, checkOutAt } = body;
  
  const updateData: {
    status: RequestStatus;
    rejectionReason?: string | null;
    approvedAt?: Date | null;
    rejectedAt?: Date | null;
    checkOutAt?: Date;
  } = {
    status: status as RequestStatus,
    rejectionReason: rejectionReason || null,
  };

  // Handle timestamp updates based on status
  if (status === "APPROVED") {
    updateData.approvedAt = new Date();
  } else if (status === "REJECTED") {
    updateData.rejectedAt = new Date();
  }

  // Handle check out timestamp
  if (checkOutAt) {
    updateData.checkOutAt = new Date(checkOutAt);
  }

  const updatedRequest = await db.vehicleRequest.update({
    where: { id },
    data: updateData,
  });
  
  return NextResponse.json(updatedRequest);
}