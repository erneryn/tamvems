import { NextRequest, NextResponse } from "next/server";
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await db.vehicle.findUnique({
    where: { id },
  });

  return NextResponse.json(vehicle);
}