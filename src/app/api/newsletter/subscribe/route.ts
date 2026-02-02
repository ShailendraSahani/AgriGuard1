import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    await dbConnect();

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return NextResponse.json({ error: 'Email already subscribed' }, { status: 400 });
    }

    // Create new subscriber
    const subscriber = new Newsletter({ email });
    await subscriber.save();

    return NextResponse.json({ message: 'Successfully subscribed to newsletter' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
