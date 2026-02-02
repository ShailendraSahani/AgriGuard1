import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Service from '@/models/Service';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'provider') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const services = await Service.find({ provider: (session.user as any)._id });
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'provider') {
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
      provider: (session.user as any)._id,
    });

    await service.save();
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
