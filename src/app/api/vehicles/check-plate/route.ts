import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const plate = searchParams.get('plate');

    if (!plate) {
      return Response.json({ error: 'Plate number is required' }, { status: 400 });
    }

    const existingVehicle = await db.vehicle.findUnique({
      where: { plate: plate.toUpperCase() }
    });

    return Response.json({ exists: !!existingVehicle });
  } catch (error) {
    console.error('Error checking plate:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
