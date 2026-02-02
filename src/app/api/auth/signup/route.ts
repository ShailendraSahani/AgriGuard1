import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { name, email, password, role, location, contact, farmSize, crops, experienceYears, servicesOffered, certifications } = await request.json();

    if (!name || !email || !password || !role || !location || !contact) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (role === 'farmer' && (!farmSize || !crops)) {
      return NextResponse.json({ error: 'Missing required fields for farmer' }, { status: 400 });
    }

    if (role === 'provider' && (!servicesOffered || !certifications)) {
      return NextResponse.json({ error: 'Missing required fields for provider' }, { status: 400 });
    }

    if ((role === 'farmer' || role === 'provider') && (experienceYears == null || isNaN(experienceYears) || experienceYears < 0)) {
      return NextResponse.json({ error: 'Invalid experience years' }, { status: 400 });
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      profile: {
        location,
        contact,
        ...(role === 'farmer' && { farmSize, crops, experienceYears }),
        ...(role === 'provider' && { servicesOffered, certifications, experienceYears }),
      },
    });

    await user.save();

    return NextResponse.json({ message: 'User created successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
