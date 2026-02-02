import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import LeaseRequest from '../../../../models/LeaseRequest';
import Land from '../../../../models/Land';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { sendLeaseRequestResponse } from '../../../../lib/email';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, agreement } = await request.json();
    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await dbConnect();
    const leaseRequest = await LeaseRequest.findById(id).populate('land');
    if (!leaseRequest) {
      return NextResponse.json({ error: 'Lease request not found' }, { status: 404 });
    }

    // Check if the farmer owns the land
    if (leaseRequest.land.farmer.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    leaseRequest.status = status;
    if (agreement) leaseRequest.agreement = agreement;
    leaseRequest.respondedAt = new Date();
    await leaseRequest.save();

    // If accepted, update land status
    if (status === 'accepted') {
      await Land.findByIdAndUpdate(leaseRequest.land._id, { availabilityStatus: 'leased' });
    }

    return NextResponse.json(leaseRequest);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update lease request' }, { status: 500 });
  }
}
