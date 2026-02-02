import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Service from '@/models/Service';
import { getSocketServer } from '@/lib/globalSocket';
import { sendBookingConfirmation } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceId, bookingDate, notes } = await request.json();

    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const booking = new Booking({
      service: serviceId,
      farmer: (session.user as any)._id,
      provider: service.provider,
      bookingDate: new Date(bookingDate),
      notes,
    });

    await booking.save();

    // Populate booking data for email
    await booking.populate('service', 'name');
    await booking.populate('farmer', 'name email');
    await booking.populate('provider', 'name email');

    // Send booking confirmation email with PDF to farmer
    sendBookingConfirmation(booking.farmer.email, booking);

    // Emit real-time event to farmer and provider
    const io = getSocketServer();
    if (io) {
      io.to(booking.farmer.toString()).emit('bookingCreated', booking);
      io.to(booking.provider.toString()).emit('bookingCreated', booking);
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
