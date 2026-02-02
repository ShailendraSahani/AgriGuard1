import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Land from '@/models/Land';

interface SessionUser {
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as SessionUser)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const lands = await Land.find().populate('farmer', 'name email');
    return NextResponse.json(lands);
  } catch (error) {
    console.error('Error fetching lands:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as SessionUser)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { title, location, size, soilType, waterAvailability, leasePrice, leaseDuration, farmer, images, availabilityStatus } = body;

    const land = new Land({
      title,
      location,
      size,
      soilType,
      waterAvailability,
      leasePrice,
      leaseDuration,
      farmer,
      images,
      availabilityStatus
    });

    await land.save();

    const savedLand = await Land.findById(land._id).populate('farmer', 'name email');
    return NextResponse.json(savedLand, { status: 201 });
  } catch (error) {
    console.error('Error creating land:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
