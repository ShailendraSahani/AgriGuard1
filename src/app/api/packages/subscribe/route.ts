import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Package from '@/models/Package';
import Subscription from '@/models/Subscription';
import Razorpay from 'razorpay';
import { getSocketServer } from '@/lib/globalSocket';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { packageId, paymentMethod = 'razorpay', autoRenew = false } = await request.json();

    const pkg = await Package.findById(packageId);
    if (!pkg || !pkg.isActive) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    const amount = pkg.discountPrice ?? pkg.price;
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + pkg.durationDays);

    const subscription = await Subscription.create({
      user: (session.user as { id: string }).id,
      package: pkg._id,
      status: 'pending',
      startDate,
      endDate,
      autoRenew,
      paymentMethod,
      amountPaid: amount,
    });

    let paymentData: any = null;
    if (paymentMethod === 'razorpay') {
      const order = await razorpay.orders.create({
        amount: amount * 100,
        currency: 'INR',
        receipt: `sub_${subscription._id}`,
      });
      subscription.razorpayOrderId = order.id;
      await subscription.save();
      paymentData = order;
    }

    const io = getSocketServer();
    if (io) {
      io.to((session.user as { id: string }).id).emit('subscription-updated');
    }

    return NextResponse.json({ subscriptionId: subscription._id, paymentData });
  } catch (error) {
    console.error('Subscription create error:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
