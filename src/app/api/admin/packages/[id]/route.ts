import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Package from '@/models/Package';
import { getSocketServer } from '@/lib/globalSocket';

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

    const updateData: Partial<{
      name: string;
      planType: string;
      crop: string;
      durationDays: number;
      price: number;
      discountPrice: number;
      isPopular: boolean;
      features: string[];
      limits: {
        maxBookings?: number;
        maxReports?: number;
        maxLandArea?: number;
        expertCalls?: number;
      };
      aiModules: {
        diseaseDetection?: boolean;
        pestPrediction?: boolean;
        yieldForecast?: boolean;
        irrigationAI?: boolean;
      };
      notifications: {
        sms?: boolean;
        whatsapp?: boolean;
        email?: boolean;
      };
      satelliteMonitoring?: boolean;
      support?: string;
      marketplaceAccess?: boolean;
      benefits?: string[];
      provider: string;
      isActive: boolean;
    }> = {};

    if (name !== undefined) updateData.name = name;
    if (planType !== undefined) updateData.planType = planType;
    if (crop !== undefined) updateData.crop = crop;
    if (durationDays !== undefined) updateData.durationDays = durationDays;
    if (price !== undefined) updateData.price = price;
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice;
    if (isPopular !== undefined) updateData.isPopular = isPopular;
    if (features !== undefined) updateData.features = features;
    if (limits !== undefined) updateData.limits = limits;
    if (aiModules !== undefined) updateData.aiModules = aiModules;
    if (notifications !== undefined) updateData.notifications = notifications;
    if (satelliteMonitoring !== undefined) updateData.satelliteMonitoring = satelliteMonitoring;
    if (support !== undefined) updateData.support = support;
    if (marketplaceAccess !== undefined) updateData.marketplaceAccess = marketplaceAccess;
    if (benefits !== undefined) updateData.benefits = benefits;
    if (provider !== undefined) updateData.provider = provider;
    if (isActive !== undefined) updateData.isActive = isActive;

    const pkg = await Package.findByIdAndUpdate(id, updateData, { new: true })
      .populate('provider', 'name email');

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    const io = getSocketServer();
    if (io) {
      io.emit('packages-updated');
    }
    return NextResponse.json(pkg);
  } catch (error) {
    console.error('Error updating package:', error);
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

    const pkg = await Package.findByIdAndDelete(id);

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    const io = getSocketServer();
    if (io) {
      io.emit('packages-updated');
    }
    return NextResponse.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
