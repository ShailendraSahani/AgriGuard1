import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Land from '@/models/Land';

interface SessionUser {
  role: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as SessionUser)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { title, location, size, soilType, waterAvailability, leasePrice, leaseDuration, images, availabilityStatus, farmer } = body;

    const updateData: Partial<{
      title: string;
      location: {
        state: string;
        district: string;
        village: string;
      };
      size: {
        value: number;
        unit: string;
      };
      soilType: string;
      waterAvailability: string;
      leasePrice: number;
      leaseDuration: string;
      images: string[];
      availabilityStatus: string;
      farmer: string;
    }> = {};

    if (title !== undefined) updateData.title = title;
    if (location !== undefined) updateData.location = location;
    if (size !== undefined) updateData.size = size;
    if (soilType !== undefined) updateData.soilType = soilType;
    if (waterAvailability !== undefined) updateData.waterAvailability = waterAvailability;
    if (leasePrice !== undefined) updateData.leasePrice = leasePrice;
    if (leaseDuration !== undefined) updateData.leaseDuration = leaseDuration;
    if (images !== undefined) updateData.images = images;
    if (availabilityStatus !== undefined) updateData.availabilityStatus = availabilityStatus;
    if (farmer !== undefined) updateData.farmer = farmer;

    const land = await Land.findByIdAndUpdate(id, updateData, { new: true })
      .populate('farmer', 'name email');

    if (!land) {
      return NextResponse.json(
        { error: 'Land not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(land);
  } catch (error) {
    console.error('Error updating land:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as SessionUser)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    const land = await Land.findByIdAndDelete(id);

    if (!land) {
      return NextResponse.json(
        { error: 'Land not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Land deleted successfully' });
  } catch (error) {
    console.error('Error deleting land:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
