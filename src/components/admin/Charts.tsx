'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  // Sample data for demonstration
  const defaultBookingsData = [
    { month: 'Jan', bookings: 65 },
    { month: 'Feb', bookings: 59 },
    { month: 'Mar', bookings: 80 },
    { month: 'Apr', bookings: 81 },
    { month: 'May', bookings: 56 },
    { month: 'Jun', bookings: 55 },
  ];

  const defaultRevenueData = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4500 },
    { month: 'May', revenue: 6000 },
    { month: 'Jun', revenue: 5500 },
  ];

  const bookings = bookingsData.length > 0 ? bookingsData : defaultBookingsData;
  const revenue = revenueData.length > 0 ? revenueData : defaultRevenueData;

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
