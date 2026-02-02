import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Package from '@/models/Package';

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
    const { name, crop, duration, price, features, description, provider, isActive } = body;

    const updateData: Partial<{
      name: string;
      crop: string;
      duration: string;
      price: number;
      features: string[];
      description: string;
      provider: string;
      isActive: boolean;
    }> = {};

    if (name !== undefined) updateData.name = name;
    if (crop !== undefined) updateData.crop = crop;
    if (duration !== undefined) updateData.duration = duration;
    if (price !== undefined) updateData.price = price;
    if (features !== undefined) updateData.features = features;
    if (description !== undefined) updateData.description = description;
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

    return NextResponse.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
