import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Package from '@/models/Package';
import User from '@/models/User';
import { sendPackageAdded } from '@/lib/email';
import { getSocketServer } from '@/lib/globalSocket';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const crop = searchParams.get('crop');
    const provider = searchParams.get('provider');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    const query: Record<string, any> = { isActive: true };

    if (crop) {
      query.crop = { $regex: crop, $options: 'i' };
    }

    if (provider) {
      query.provider = provider;
    }

    const packages = await Package.find(query)
      .populate('provider', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Package.countDocuments(query);

    return NextResponse.json({
      packages,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
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

    if (!session || (session.user as { role: string })?.role !== 'provider') {
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
    } = body;

    if (!name || !crop || !durationDays || price == null || !features) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newPackage = new Package({
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
      provider: (session.user as { id: string }).id,
    });

    await newPackage.save();

    // Get provider email for sending confirmation
    const provider = await User.findById((session.user as { id: string }).id);
    if (provider) {
      sendPackageAdded(provider.email, newPackage);
    }

    const io = getSocketServer();
    if (io) {
      io.emit('packages-updated');
    }

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
