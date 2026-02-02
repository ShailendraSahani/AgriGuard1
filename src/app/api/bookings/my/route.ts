import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await Booking.find({ farmer: (session.user as any)._id })
      .populate('service', 'name category price')
      .populate('provider', 'name email profile')
      .sort({ createdAt: -1 });

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
