'use client';

import { motion } from 'framer-motion';
import { Users, Wrench, MapPin, Package, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardsProps {
  stats: {
    totalFarmers?: number;
    totalProviders?: number;
    totalLandOwners?: number;
    totalProducts?: number;
    totalBookings?: number;
    totalRevenue?: number;
  };
}

const statsData = [
  {
    title: 'Total Farmers',
    key: 'totalFarmers',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Service Providers',
    key: 'totalProviders',
    icon: Wrench,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Land Owners',
    key: 'totalLandOwners',
    icon: MapPin,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Products Listed',
    key: 'totalProducts',
    icon: Package,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Total Bookings',
    key: 'totalBookings',
    icon: Calendar,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    title: 'Revenue',
    key: 'totalRevenue',
    icon: DollarSign,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        const value = stats[stat.key as keyof typeof stats] || 0;

        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.key === 'totalRevenue' ? `₹${value.toLocaleString()}` : value.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.key === 'totalRevenue' ? '+12% from last month' : '+5% from last month'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
