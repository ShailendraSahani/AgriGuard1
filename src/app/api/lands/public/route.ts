import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Land from '@/models/Land';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    const lands = await Land.find({})
      .populate('farmer', 'name')
      .limit(limit)
      .sort({ createdAt: -1 });

    return NextResponse.json({ lands });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lands' }, { status: 500 });
  }
}
