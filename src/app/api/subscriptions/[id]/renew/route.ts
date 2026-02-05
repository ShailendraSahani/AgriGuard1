import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Subscription from '@/models/Subscription';
import Package from '@/models/Package';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const { paymentMethod = 'razorpay' } = await request.json();

    const existing = await Subscription.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }
    if (existing.user.toString() !== (session.user as { id: string }).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pkg = await Package.findById(existing.package);
    if (!pkg || !pkg.isActive) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    const amount = pkg.discountPrice ?? pkg.price;
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + pkg.durationDays);

    const renewal = await Subscription.create({
      user: (session.user as { id: string }).id,
      package: pkg._id,
      status: 'pending',
      startDate,
      endDate,
      autoRenew: existing.autoRenew,
      paymentMethod,
      amountPaid: amount,
      renewalCount: existing.renewalCount + 1,
    });

    let paymentData: any = null;
    if (paymentMethod === 'razorpay') {
      const order = await razorpay.orders.create({
        amount: amount * 100,
        currency: 'INR',
        receipt: `renew_${renewal._id}`,
      });
      renewal.razorpayOrderId = order.id;
      await renewal.save();
      paymentData = order;
    }

    return NextResponse.json({ subscriptionId: renewal._id, paymentData });
  } catch (error) {
    console.error('Renew subscription error:', error);
    return NextResponse.json({ error: 'Failed to renew subscription' }, { status: 500 });
  }
}
