import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import LeaseRequest from '@/models/LeaseRequest';
import Land from '@/models/Land';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { sendLeaseRequestNotification } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Fetch lease requests for lands owned by the farmer
    const leaseRequests = await LeaseRequest.find()
      .populate({
        path: 'land',
        match: { farmer: session.user.id },
        select: 'title location'
      })
      .populate('requester', 'name email')
      .sort({ requestedAt: -1 });

    // Filter out requests where land is null (not owned by the farmer)
    const filteredRequests = leaseRequests.filter(request => request.land !== null);

    return NextResponse.json(filteredRequests);
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

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { land } = body;

    if (!land) {
      return NextResponse.json(
        { error: 'Land ID is required' },
        { status: 400 }
      );
    }

    // Check if user is allowed to request lease (only 'user' and 'farmer' roles, and if 'farmer', not the owner)
    if (!['user', 'farmer'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Only users and farmers can request land leases' },
        { status: 403 }
      );
    }

    // If user is a farmer, check if they own the land
    if (session.user.role === 'farmer') {
      const landDetails = await Land.findById(land);
      if (landDetails && landDetails.farmer.toString() === session.user.id) {
        return NextResponse.json(
          { error: 'You cannot request to lease your own land' },
          { status: 403 }
        );
      }
    }

    // Check if user already has a pending request for this land
    const existingRequest = await LeaseRequest.findOne({
      land,
      requester: session.user.id,
      status: 'pending'
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request for this land' },
        { status: 400 }
      );
    }

    const leaseRequest = new LeaseRequest({
      land,
      requester: session.user.id,
      status: 'pending'
    });

    await leaseRequest.save();

    // Fetch the land details to get the farmer (land owner)
    const landDetails = await Land.findById(land).populate('farmer', 'name email');

    if (!landDetails) {
      return NextResponse.json(
        { error: 'Land not found' },
        { status: 404 }
      );
    }

    // Create a notification for the land owner
    const notification = new Notification({
      user: landDetails.farmer._id,
      title: 'New Lease Request',
      message: `You have received a new lease request for your land "${landDetails.title}" from ${session.user.name || 'a user'}.`,
      type: 'lease',
    });

    await notification.save();

    // Send real-time notification via socket
    const io = (global as any).io;
    if (io) {
      io.to(landDetails.farmer._id.toString()).emit('lease-request', {
        message: 'New lease request received',
        land: landDetails.title,
        requester: session.user.name || 'User'
      });
    }

    // Send email notification to land owner
    await sendLeaseRequestNotification(
      landDetails.farmer.email,
      landDetails,
      { name: session.user.name || 'User', email: session.user.email }
    );

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
