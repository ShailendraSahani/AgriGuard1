import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch completed bookings for income calculation
    const completedBookings = await Booking.find({
      farmer: userId,
      status: 'Completed'
    }).populate('service', 'price');

    // Calculate total income
    const totalIncome = completedBookings.reduce((sum, booking) => {
      return sum + (booking.service?.price || 0);
    }, 0);

    // Mock monthly income data (last 4 months)
    const now = new Date();
    const monthlyIncome = [];
    for (let i = 3; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      const income = Math.floor(Math.random() * 10000) + 5000; // Mock data
      monthlyIncome.push({ month: monthName, income });
    }

    // Mock crop growth data (last 4 weeks)
    const cropData = [
      { week: 'Week 1', growth: 20 },
      { week: 'Week 2', growth: 45 },
      { week: 'Week 3', growth: 70 },
      { week: 'Week 4', growth: 95 },
    ];

    return NextResponse.json({
      totalIncome,
      monthlyIncome,
      cropData,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
