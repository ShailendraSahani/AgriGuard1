import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import LeaseRequest from '@/models/LeaseRequest';

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

    const leaseRequests = await LeaseRequest.find()
      .populate('land', 'title location')
      .populate('requester', 'name email');
    return NextResponse.json(leaseRequests);
  } catch (error) {
    console.error('Error fetching lease requests:', error);
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
    const { land, requester, status, agreement } = body;

    const leaseRequest = new LeaseRequest({
      land,
      requester,
      status,
      agreement
    });

    await leaseRequest.save();

    const savedLeaseRequest = await LeaseRequest.findById(leaseRequest._id)
      .populate('land', 'title location')
      .populate('requester', 'name email');
    return NextResponse.json(savedLeaseRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating lease request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
