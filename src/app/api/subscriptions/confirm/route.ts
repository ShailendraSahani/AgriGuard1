import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Subscription from '@/models/Subscription';
import { getSocketServer } from '@/lib/globalSocket';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { subscriptionId, razorpayPaymentId } = await request.json();

    const sub = await Subscription.findById(subscriptionId);
    if (!sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }
    if (sub.user.toString() !== (session.user as { id: string }).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    sub.status = 'active';
    if (razorpayPaymentId) {
      sub.razorpayPaymentId = razorpayPaymentId;
    }
    await sub.save();

    const io = getSocketServer();
    if (io) {
      io.to((session.user as { id: string }).id).emit('subscription-updated');
    }

    return NextResponse.json(sub);
  } catch (error) {
    console.error('Confirm subscription error:', error);
    return NextResponse.json({ error: 'Failed to confirm subscription' }, { status: 500 });
  }
}
