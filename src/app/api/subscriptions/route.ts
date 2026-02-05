import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Subscription from '@/models/Subscription';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const userId = (session.user as { id: string }).id;

    const subs = await Subscription.find({ user: userId })
      .populate('package')
      .sort({ createdAt: -1 });

    const now = new Date();
    for (const sub of subs) {
      if (sub.status === 'active' && sub.endDate < now) {
        sub.status = 'expired';
        await sub.save();
      }
    }

    return NextResponse.json(subs);
  } catch (error) {
    console.error('Fetch subscriptions error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}
