'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSocket } from '@/contexts/SocketContext';

interface ChartData {
  month: string;
  bookings?: number;
  revenue?: number;
}

interface ChartsProps {
  bookingsData?: ChartData[];
  revenueData?: ChartData[];
}

export function Charts({ bookingsData = [], revenueData = [] }: ChartsProps) {
  const { socket } = useSocket();
  const [liveBookingsData, setLiveBookingsData] = useState<ChartData[]>([]);
  const [liveRevenueData, setLiveRevenueData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const data = await response.json();
        setLiveBookingsData(data.bookingsData || []);
        setLiveRevenueData(data.revenueData || []);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Listen for real-time updates
    if (socket) {
      socket.on('analytics-update', () => {
        fetchAnalytics();
      });

      socket.on('booking-created', () => {
        fetchAnalytics();
      });

      socket.on('booking-updated', () => {
        fetchAnalytics();
      });
    }

    return () => {
      if (socket) {
        socket.off('analytics-update');
        socket.off('booking-created');
        socket.off('booking-updated');
      }
    };
  }, [socket]);

  // Use live data if available, otherwise fall back to props or defaults
  const bookings = liveBookingsData.length > 0 ? liveBookingsData :
                   bookingsData.length > 0 ? bookingsData : [
    { month: 'Jan', bookings: 0 },
    { month: 'Feb', bookings: 0 },
    { month: 'Mar', bookings: 0 },
    { month: 'Apr', bookings: 0 },
    { month: 'May', bookings: 0 },
    { month: 'Jun', bookings: 0 },
  ];

  const revenue = liveRevenueData.length > 0 ? liveRevenueData :
                  revenueData.length > 0 ? revenueData : [
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Apr', revenue: 0 },
    { month: 'May', revenue: 0 },
    { month: 'Jun', revenue: 0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-green-600">Monthly Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bookings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#16A34A"
                  strokeWidth={2}
                  dot={{ fill: '#16A34A' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-green-600">Revenue Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#16A34A" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
