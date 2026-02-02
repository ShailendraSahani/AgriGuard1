import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Land from '@/models/Land';
import Service from '@/models/Service';
import Booking from '@/models/Booking';
import Package from '@/models/Package';

interface SessionUser {
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as SessionUser)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get counts
    const [
      totalUsers,
      totalProviders,
      totalLands,
      totalServices,
      totalBookings,
      totalPackages,
      recentBookings,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'provider' }),
      Land.countDocuments(),
      Service.countDocuments(),
      Booking.countDocuments(),
      Package.countDocuments(),
      Booking.find()
        .populate('farmer', 'name email')
        .populate('service', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt')
    ]);

    // Calculate revenue (simplified - in real app, this would be from payment records)
    const revenue = totalBookings * 500; // Assuming average booking value

    return NextResponse.json({
      stats: {
        totalUsers,
        totalProviders,
        totalLands,
        totalServices,
        totalBookings,
        totalPackages,
        revenue
      },
      recentActivity: {
        bookings: recentBookings,
        users: recentUsers
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
