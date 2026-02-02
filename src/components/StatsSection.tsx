'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { MapPin, Users, Wrench, TrendingUp } from 'lucide-react';
import useSWR from 'swr';

interface StatItemProps {
  endValue: number;
  label: string;
  suffix?: string;
  inView: boolean;
  icon?: React.ReactNode;
}

function StatItem({ endValue, label, suffix = '', inView }: StatItemProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (inView) {
      const controls = animate(count, endValue, {
        duration: 2,
        ease: "easeOut"
      });
      return controls.stop;
    }
  }, [count, endValue, inView]);

  return (
    <motion.div
      className="text-center glass rounded-2xl p-8 shadow-modern hover:shadow-modern-lg transition-modern transform hover:scale-105"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <motion.div
        className="text-4xl md:text-5xl font-extrabold gradient-text mb-3"
        initial={{ scale: 0.5 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <motion.span>{rounded}</motion.span>
        {suffix}
      </motion.div>
      <div className="text-green-700 font-semibold text-lg">{label}</div>
    </motion.div>
  );
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { data, error, isLoading } = useSWR('/api/admin/stats', fetcher, { refreshInterval: 5000 });

  const stats = data?.stats || {
    totalLands: 500,
    totalServices: 200,
    totalUsers: 1000,
    totalBookings: 5000
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-green-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              className="animate-spin rounded-full h-16 w-16 border-4 border-green-700 border-t-yellow-700 mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-extrabold text-green-800 mb-6 gradient-text">
            AgriGuard in Numbers
          </h2>
          <p className="text-xl text-green-700 max-w-2xl mx-auto">
            Real-time statistics showcasing our growing agricultural community
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem
            endValue={stats.totalLands}
            label="Available Lands"
            inView={inView}
          />
          <StatItem
            endValue={stats.totalServices}
            label="Farming Services"
            inView={inView}
          />
          <StatItem
            endValue={stats.totalUsers}
            label="Active Farmers"
            inView={inView}
          />
          <StatItem
            endValue={stats.totalBookings}
            label="Successful Bookings"
            inView={inView}
          />
        </div>
      </div>
    </section>
  );
}
