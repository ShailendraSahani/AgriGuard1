'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

interface AnalyticsData {
  bookingsData: { month: string; bookings: number }[];
  revenueData: { month: string; revenue: number }[];
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as { role: string })?.role !== 'admin') {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as { role: string })?.role !== 'admin') {
      return;
    }
    fetchAnalytics();
  }, [session, status]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!session || (session.user as { role: string })?.role !== 'admin') return null;

  const totalBookings = analyticsData?.bookingsData.reduce((sum, item) => sum + item.bookings, 0) || 0;
  const totalRevenue = analyticsData?.revenueData.reduce((sum, item) => sum + item.revenue, 0) || 0;
  const avgBookingsPerMonth = analyticsData?.bookingsData.length ? totalBookings / analyticsData.bookingsData.length : 0;
  const avgRevenuePerMonth = analyticsData?.revenueData.length ? totalRevenue / analyticsData.revenueData.length : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="rounded-2xl shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    Last 6 months
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Last 6 months
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Bookings/Month</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgBookingsPerMonth.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">
                    Monthly average
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Revenue/Month</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{avgRevenuePerMonth.toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground">
                    Monthly average
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bookings Chart */}
              <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-green-600">Monthly Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {analyticsData?.bookingsData.map((item, index) => (
                      <motion.div
                        key={item.month}
                        initial={{ height: 0 }}
                        animate={{ height: `${(item.bookings / Math.max(...analyticsData.bookingsData.map(d => d.bookings))) * 100}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="bg-green-500 rounded-t flex-1 flex flex-col justify-end items-center text-white text-xs font-medium"
                        style={{ minHeight: '20px' }}
                      >
                        <span className="mb-1">{item.bookings}</span>
                        <div className="w-full bg-green-600 rounded-t" style={{ height: '100%' }}></div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-sm text-gray-600">
                    {analyticsData?.bookingsData.map(item => (
                      <span key={item.month}>{item.month}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Chart */}
              <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-green-600">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {analyticsData?.revenueData.map((item, index) => (
                      <motion.div
                        key={item.month}
                        initial={{ height: 0 }}
                        animate={{ height: `${(item.revenue / Math.max(...analyticsData.revenueData.map(d => d.revenue))) * 100}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="bg-blue-500 rounded-t flex-1 flex flex-col justify-end items-center text-white text-xs font-medium"
                        style={{ minHeight: '20px' }}
                      >
                        <span className="mb-1">₹{item.revenue}</span>
                        <div className="w-full bg-blue-600 rounded-t" style={{ height: '100%' }}></div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-sm text-gray-600">
                    {analyticsData?.revenueData.map(item => (
                      <span key={item.month}>{item.month}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Table */}
            <Card className="rounded-2xl shadow-lg mt-6">
              <CardHeader>
                <CardTitle className="text-green-600">Monthly Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Month</th>
                        <th className="text-left py-2">Bookings</th>
                        <th className="text-left py-2">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData?.bookingsData.map((bookingItem, index) => {
                        const revenueItem = analyticsData.revenueData[index];
                        return (
                          <tr key={bookingItem.month} className="border-b">
                            <td className="py-2 font-medium">{bookingItem.month}</td>
                            <td className="py-2">{bookingItem.bookings}</td>
                            <td className="py-2">₹{revenueItem?.revenue || 0}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
