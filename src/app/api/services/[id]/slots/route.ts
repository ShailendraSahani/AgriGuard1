import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Slot from '@/models/Slot';
import Service from '@/models/Service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 });
    }

    // Check if service exists
    const service = await Service.findById(id);
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Check if date is within availability
    const selectedDate = new Date(date);
    const startDate = new Date(service.availabilityDates.start);
    const endDate = new Date(service.availabilityDates.end);

    if (selectedDate < startDate || selectedDate > endDate) {
      return NextResponse.json({ error: 'Date not available' }, { status: 400 });
    }

    // Get existing slots for this service and date
    let slots = await Slot.find({
      service: id,
      date: selectedDate,
    });

    // If no slots exist, generate default slots (9 AM to 5 PM, every hour)
    if (slots.length === 0) {
      const defaultSlots = [];
      for (let hour = 9; hour <= 17; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        defaultSlots.push({
          service: id,
          date: selectedDate,
          time,
          status: 'available',
        });
      }

      slots = await Slot.insertMany(defaultSlots);
    }

    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { date, time, status } = await request.json();

    const slot = new Slot({
      service: id,
      date: new Date(date),
      time,
      status: status || 'available',
    });

    await slot.save();

    // Emit real-time update
    const io = (await import('@/lib/globalSocket')).getSocketServer();
    if (io) {
      io.emit('slot-updated', slot);
    }

    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error('Error creating slot:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
