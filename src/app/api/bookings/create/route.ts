import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Service from '@/models/Service';
import Slot from '@/models/Slot';
import { getSocketServer } from '@/lib/globalSocket';
import { sendBookingConfirmation, sendProviderBookingAlert } from '@/lib/email';
import Notification from '@/models/Notification';
import { sendSms } from '@/lib/sms';
import Razorpay from 'razorpay';
import QRCode from 'qrcode';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !['farmer', 'user'].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceId, slotId, paymentMethod, notes } = await request.json();

    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const slot = await Slot.findById(slotId);
    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    if (slot.status !== 'selected' && slot.status !== 'available') {
      return NextResponse.json({ error: 'Slot not available' }, { status: 400 });
    }

    // Create booking
    const totalAmount = slot.price || service.price;
    const booking = new Booking({
      service: serviceId,
      farmer: session.user.id,
      provider: service.provider,
      slot: slot._id,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      status: paymentMethod === 'cod' ? 'pending' : 'confirmed',
      workStartDate: slot.date,
      notes,
    });

    await booking.save();

    // Update slot status to booked
    slot.status = 'booked';
    await slot.save();

    // Handle payment
    let paymentData = null;
    if (paymentMethod === 'razorpay') {
      const options = {
        amount: totalAmount * 100, // Razorpay expects amount in paisa
        currency: 'INR',
        receipt: `booking_${booking._id}`,
      };
      paymentData = await razorpay.orders.create(options);
    }

    // Generate QR code for booking
    const qrCodeData = await QRCode.toDataURL(JSON.stringify({
      bookingId: booking._id,
      service: service.name,
      date: slot.date.toISOString(),
      time: slot.time,
    }));

    booking.qrCode = qrCodeData;
    await booking.save();

    // Populate booking data for email
    await booking.populate('service', 'name');
    await booking.populate('farmer', 'name email');
    await booking.populate('provider', 'name email profile');

    // Send booking confirmation email with PDF to farmer
    sendBookingConfirmation(booking.farmer.email, booking);
    sendProviderBookingAlert(booking.provider.email, booking);

    // Create notifications
    await Notification.create([
      {
        user: booking.farmer._id,
        title: 'Booking Confirmed',
        message: `Your booking for ${service.name} is ${booking.status}.`,
        type: 'booking',
      },
      {
        user: booking.provider._id,
        title: 'New Booking Request',
        message: `New booking for ${service.name} from ${booking.farmer.name}.`,
        type: 'booking',
      },
    ]);

    // SMS alerts (if contact numbers exist)
    if (booking.provider.profile?.contact) {
      sendSms(
        booking.provider.profile.contact,
        `AgriGuard: New booking for ${service.name}. Please review in your dashboard.`
      );
    }

    // Emit real-time event to farmer and provider
    const io = getSocketServer();
    if (io) {
      io.to(booking.farmer.toString()).emit('bookingCreated', booking);
      io.to(booking.provider.toString()).emit('bookingCreated', booking);
      io.emit('slot-updated', slot);
      io.to(booking.provider.toString()).emit('notificationCreated');
      io.to(booking.farmer.toString()).emit('notificationCreated');
    }

    return NextResponse.json({
      booking,
      paymentData,
      qrCode: qrCodeData,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
