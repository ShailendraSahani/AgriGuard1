import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Land from '@/models/Land';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const land = await Land.findById(id).populate('farmer', 'name email profile.location profile.contact');
    if (!land) {
      return NextResponse.json({ error: 'Land not found' }, { status: 404 });
    }
    return NextResponse.json(land);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch land' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await dbConnect();
    const land = await Land.findOneAndUpdate(
      { _id: id, farmer: session.user.id },
      body,
      { new: true }
    );
    if (!land) {
      return NextResponse.json({ error: 'Land not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json(land);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update land' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const land = await Land.findOneAndDelete({ _id: id, farmer: session.user.id });
    if (!land) {
      return NextResponse.json({ error: 'Land not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Land deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete land' }, { status: 500 });
  }
}
