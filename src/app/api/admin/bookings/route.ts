import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';

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

    const bookings = await Booking.find()
      .populate('service', 'name price')
      .populate('farmer', 'name email')
      .populate('provider', 'name email');
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
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
    const { service, farmer, provider, status, bookingDate, workStartDate, workEndDate, notes } = body;

    const booking = new Booking({
      service,
      farmer,
      provider,
      status,
      bookingDate,
      workStartDate,
      workEndDate,
      notes
    });

    await booking.save();

    const savedBooking = await Booking.findById(booking._id)
      .populate('service', 'name')
      .populate('farmer', 'name email')
      .populate('provider', 'name email');
    return NextResponse.json(savedBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
