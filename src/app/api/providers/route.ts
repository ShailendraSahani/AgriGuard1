import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    const providers = await User.find({ role: 'provider' })
      .select('name email profile location servicesCount landsCount rating')
      .limit(limit)
      .sort({ createdAt: -1 });

    return NextResponse.json({ providers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}
