import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Land from '@/models/Land';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const lands = await Land.find({ farmer: session.user.id });
    return NextResponse.json(lands);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lands' }, { status: 500 });
  }
}
