'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Wrench,
  MapPin,
  Package,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: Home,
  },
  {
    title: 'Farmers',
    href: '/admin/farmers',
    icon: Users,
  },
  {
    title: 'Service Providers',
    href: '/admin/providers',
    icon: Wrench,
  },
  {
    title: 'Land Owners',
    href: '/admin/land-owners',
    icon: MapPin,
  },
  {
    title: 'Marketplace',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Bookings',
    href: '/admin/bookings',
    icon: Calendar,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.div
      className={cn(
        'flex h-full flex-col border-r bg-white shadow-sm',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
      initial={{ width: collapsed ? 64 : 256 }}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <motion.h2
            className="text-xl font-bold text-green-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            AgriGuard
          </motion.h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start h-10',
                      collapsed ? 'px-2' : 'px-3',
                      isActive && 'bg-green-50 text-green-700 hover:bg-green-100'
                    )}
                  >
                    <item.icon className={cn('h-4 w-4', !collapsed && 'mr-3')} />
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
