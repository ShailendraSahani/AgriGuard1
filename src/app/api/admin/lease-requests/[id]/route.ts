import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import LeaseRequest from '@/models/LeaseRequest';

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
    const { land, requester, status, agreement, requestedAt, respondedAt } = body;

    const updateData: Partial<{
      land: string;
      requester: string;
      status: string;
      agreement?: string;
      requestedAt: Date;
      respondedAt?: Date;
    }> = {};

    if (land !== undefined) updateData.land = land;
    if (requester !== undefined) updateData.requester = requester;
    if (status !== undefined) updateData.status = status;
    if (agreement !== undefined) updateData.agreement = agreement;
    if (requestedAt !== undefined) updateData.requestedAt = requestedAt;
    if (respondedAt !== undefined) updateData.respondedAt = respondedAt;

    const leaseRequest = await LeaseRequest.findByIdAndUpdate(id, updateData, { new: true })
      .populate('land', 'title')
      .populate('requester', 'name email');

    if (!leaseRequest) {
      return NextResponse.json(
        { error: 'Lease request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(leaseRequest);
  } catch (error) {
    console.error('Error updating lease request:', error);
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

    const leaseRequest = await LeaseRequest.findByIdAndDelete(id);

    if (!leaseRequest) {
      return NextResponse.json(
        { error: 'Lease request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Lease request deleted successfully' });
  } catch (error) {
    console.error('Error deleting lease request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
