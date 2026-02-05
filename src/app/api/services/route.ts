import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Service from '@/models/Service';
import Slot from '@/models/Slot';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'provider') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const services = await Service.find({ provider: session.user.id });
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'provider') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, category, price, serviceArea, availabilityDates, description } = await request.json();

    const service = new Service({
      name,
      category,
      price,
      serviceArea,
      availabilityDates,
      description,
      provider: session.user.id,
    });

    await service.save();

    // Generate slots for the service
    const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const start = new Date(availabilityDates.start);
    const end = new Date(availabilityDates.end);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      for (const time of times) {
        const slot = new Slot({
          service: service._id,
          date: new Date(d),
          time,
          status: 'available'
        });
        await slot.save();
      }
    }

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
