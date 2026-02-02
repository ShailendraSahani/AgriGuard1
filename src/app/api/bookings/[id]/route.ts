import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import { getSocketServer } from '@/lib/globalSocket';

interface SessionUser {
  role: string;
  _id: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || ((session.user as SessionUser)?.role !== 'provider' && (session.user as SessionUser)?.role !== 'farmer')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Find the booking and check if the user is authorized
    const booking = await Booking.findById(id).populate('provider farmer');
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if the user is the provider or farmer of this booking
    const userId = (session.user as SessionUser)._id;
    if (booking.provider._id.toString() !== userId && booking.farmer._id.toString() !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update the booking status
    booking.status = status;
    await booking.save();

    // Populate the updated booking
    await booking.populate('service', 'name');
    await booking.populate('farmer', 'name email');
    await booking.populate('provider', 'name email');

    // Emit real-time event to farmer and provider
    const io = getSocketServer();
    if (io) {
      io.to(booking.farmer._id.toString()).emit('bookingUpdated', booking);
      io.to(booking.provider._id.toString()).emit('bookingUpdated', booking);
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
