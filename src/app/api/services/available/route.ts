import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Service from '@/models/Service';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const area = searchParams.get('area');

    let query: any = {};

    if (category) {
      query.category = category;
    }

    if (area) {
      query.serviceArea = { $regex: area, $options: 'i' };
    }

    const services = await Service.find(query).populate('provider', 'name email profile');
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
