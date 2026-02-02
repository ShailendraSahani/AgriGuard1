import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';

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

    // Get bookings from the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const bookings = await Booking.find({
      createdAt: { $gte: sixMonthsAgo }
    })
    .populate('service', 'price')
    .sort({ createdAt: 1 });

    // Group bookings by month
    const monthlyData = bookings.reduce((acc: Record<string, { bookings: number; revenue: number }>, booking) => {
      const month = booking.createdAt.toLocaleString('default', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { bookings: 0, revenue: 0 };
      }
      acc[month].bookings += 1;
      acc[month].revenue += booking.service?.price || 0;
      return acc;
    }, {});

    // Convert to array format for charts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = months[monthIndex];
      last6Months.push({
        month: monthName,
        bookings: monthlyData[monthName]?.bookings || 0,
        revenue: monthlyData[monthName]?.revenue || 0
      });
    }

    return NextResponse.json({
      bookingsData: last6Months.map(item => ({ month: item.month, bookings: item.bookings })),
      revenueData: last6Months.map(item => ({ month: item.month, revenue: item.revenue }))
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
