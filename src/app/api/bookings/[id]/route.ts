import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import { getSocketServer } from '@/lib/globalSocket';
import Notification from '@/models/Notification';
import { sendSms } from '@/lib/sms';

interface SessionUser {
  role: string;
  id: string;
}

export async function GET(
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

    const booking = await Booking.findById(id)
      .populate('service', 'name category')
      .populate('farmer', 'name email profile')
      .populate('provider', 'name email profile');

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const userId = (session.user as SessionUser).id;
    if (booking.provider._id.toString() !== userId && booking.farmer._id.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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
    const userId = (session.user as SessionUser).id;
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
    await booking.populate('farmer', 'name email profile');
    await booking.populate('provider', 'name email profile');

    // Create notification for the other party
    const targetUser = booking.provider._id.toString() === userId ? booking.farmer._id : booking.provider._id;
    await Notification.create({
      user: targetUser,
      title: 'Booking Status Updated',
      message: `Booking ${booking._id} status changed to ${booking.status}.`,
      type: 'booking',
    });

    if (booking.farmer.profile?.contact && booking.provider._id.toString() === userId) {
      sendSms(
        booking.farmer.profile.contact,
        `AgriGuard: Your booking ${booking._id} status is now ${booking.status}.`
      );
    }

    // Emit real-time event to farmer and provider
    const io = getSocketServer();
    if (io) {
      io.to(booking.farmer._id.toString()).emit('bookingUpdated', booking);
      io.to(booking.provider._id.toString()).emit('bookingUpdated', booking);
      io.to(targetUser.toString()).emit('notificationCreated');
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
