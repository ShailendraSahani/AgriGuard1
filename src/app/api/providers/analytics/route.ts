import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Service from '@/models/Service';
import Booking from '@/models/Booking';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'provider') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const providerId = session.user.id;

    // Get all services for this provider
    const services = await Service.find({ provider: providerId });

    // Get all bookings for this provider's services
    const serviceIds = services.map(service => service._id);
    const bookings = await Booking.find({ service: { $in: serviceIds } });

    // Calculate analytics
    const totalServices = services.length;
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const activeServices = services.filter(service => service.status === 'available').length;
    const completedBookings = bookings.filter(booking => booking.status === 'completed').length;
    const pendingBookings = bookings.filter(booking => booking.status === 'pending').length;

    // Monthly revenue (last 6 months)
    const monthlyRevenue = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });
      const monthRevenue = monthBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
      monthlyRevenue.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue
      });
    }

    // Service categories breakdown
    const serviceCategories = services.reduce((acc: any[], service) => {
      const category = acc.find(cat => cat.category === service.category);
      const categoryBookings = bookings.filter(booking => booking.service.toString() === service._id.toString());
      const categoryRevenue = categoryBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

      if (category) {
        category.count += 1;
        category.revenue += categoryRevenue;
      } else {
        acc.push({
          category: service.category,
          count: 1,
          revenue: categoryRevenue
        });
      }
      return acc;
    }, []);

    // Booking status breakdown
    const bookingStatus = ['pending', 'confirmed', 'completed', 'cancelled'].map(status => ({
      status,
      count: bookings.filter(booking => booking.status === status).length
    }));

    const analytics = {
      totalServices,
      totalBookings,
      totalRevenue,
      activeServices,
      completedBookings,
      pendingBookings,
      monthlyRevenue,
      serviceCategories,
      bookingStatus
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
