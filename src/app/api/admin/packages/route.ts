import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Package from '@/models/Package';
import { getSocketServer } from '@/lib/globalSocket';

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

    const packages = await Package.find().populate('provider', 'name email');
    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
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
    const {
      name,
      planType,
      crop,
      durationDays,
      price,
      discountPrice,
      isPopular,
      features,
      limits,
      aiModules,
      notifications,
      satelliteMonitoring,
      support,
      marketplaceAccess,
      benefits,
      provider,
      isActive,
    } = body;

    const packageItem = new Package({
      name,
      planType,
      crop,
      durationDays,
      price,
      discountPrice,
      isPopular,
      features,
      limits,
      aiModules,
      notifications,
      satelliteMonitoring,
      support,
      marketplaceAccess,
      benefits,
      provider,
      isActive
    });

    await packageItem.save();

    const savedPackage = await Package.findById(packageItem._id).populate('provider', 'name email');
    const io = getSocketServer();
    if (io) {
      io.emit('packages-updated');
    }
    return NextResponse.json(savedPackage, { status: 201 });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
