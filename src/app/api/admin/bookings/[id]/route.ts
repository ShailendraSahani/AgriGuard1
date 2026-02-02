import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import { getSocketServer } from '@/lib/globalSocket';

interface SessionUser {
  role: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as SessionUser)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { service, farmer, provider, status, bookingDate, workStartDate, workEndDate, notes } = body;

    const updateData: Partial<{
      service: string;
      farmer: string;
      provider: string;
      status: string;
      bookingDate: Date;
      workStartDate?: Date;
      workEndDate?: Date;
      notes?: string;
    }> = {};

    if (service !== undefined) updateData.service = service;
    if (farmer !== undefined) updateData.farmer = farmer;
    if (provider !== undefined) updateData.provider = provider;
    if (status !== undefined) updateData.status = status;
    if (bookingDate !== undefined) updateData.bookingDate = bookingDate;
    if (workStartDate !== undefined) updateData.workStartDate = workStartDate;
    if (workEndDate !== undefined) updateData.workEndDate = workEndDate;
    if (notes !== undefined) updateData.notes = notes;

    const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true })
      .populate('service', 'name')
      .populate('farmer', 'name email')
      .populate('provider', 'name email');

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as SessionUser)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
