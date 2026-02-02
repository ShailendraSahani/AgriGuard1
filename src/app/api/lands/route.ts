import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Land from '@/models/Land';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendLandAdded } from '@/lib/email';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    // Filter by availability status
    const status = searchParams.get('status');
    if (status) {
      filter.availabilityStatus = status;
    }

    // Filter by location
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const village = searchParams.get('village');

    if (state || district || village) {
      filter.location = {};
      if (state) filter.location.state = { $regex: state, $options: 'i' };
      if (district) filter.location.district = { $regex: district, $options: 'i' };
      if (village) filter.location.village = { $regex: village, $options: 'i' };
    }

    // Filter by price range
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      filter.leasePrice = {};
      if (minPrice) filter.leasePrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.leasePrice.$lte = parseFloat(maxPrice);
    }

    // Filter by size
    const minSize = searchParams.get('minSize');
    const maxSize = searchParams.get('maxSize');
    if (minSize || maxSize) {
      filter['size.value'] = {};
      if (minSize) filter['size.value'].$gte = parseFloat(minSize);
      if (maxSize) filter['size.value'].$lte = parseFloat(maxSize);
    }

    // Filter by soil type
    const soilType = searchParams.get('soilType');
    if (soilType) {
      filter.soilType = { $regex: soilType, $options: 'i' };
    }

    // Filter by water availability
    const waterAvailability = searchParams.get('waterAvailability');
    if (waterAvailability) {
      filter.waterAvailability = { $regex: waterAvailability, $options: 'i' };
    }

    const lands = await Land.find(filter)
      .populate('farmer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Land.countDocuments(filter);

    return NextResponse.json({
      lands,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching lands:', error);
    return NextResponse.json({ error: 'Failed to fetch lands' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      location,
      size,
      soilType,
      waterAvailability,
      leasePrice,
      leaseDuration,
      images = []
    } = body;

    // Validation
    if (!title || !location || !size || !soilType || !waterAvailability || !leasePrice || !leaseDuration) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    await dbConnect();

    const newLand = new Land({
      title,
      location,
      size,
      soilType,
      waterAvailability,
      leasePrice,
      leaseDuration,
      images,
      farmer: session.user.id,
    });

    const savedLand = await newLand.save();
    return NextResponse.json(savedLand, { status: 201 });
  } catch (error) {
    console.error('Error creating land:', error);
    return NextResponse.json({ error: 'Failed to create land' }, { status: 500 });
  }
}
