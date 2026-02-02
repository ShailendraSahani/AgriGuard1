'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PDFExport } from '@/components/admin/PDFExport';
import { Calendar } from 'lucide-react';

interface Booking {
  _id: string;
  service?: { name: string; price: number };
  customer?: { name: string };
  status: string;
}

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/admin/bookings');
      if (res.ok) {
        setBookings(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as { role: string })?.role !== 'admin') {
      router.push('/auth/signin');
      return;
    }
    fetchBookings();
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!session || (session.user as { role: string })?.role !== 'admin') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
        <PDFExport data={bookings as unknown as Record<string, unknown>[]} title="Bookings Report" filename="bookings_report" />
      </div>

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-green-600 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Bookings ({bookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map(booking => (
                <TableRow key={booking._id}>
                  <TableCell className="font-medium">{booking.service?.name || 'Service Deleted'}</TableCell>
                  <TableCell>{booking.customer?.name || 'Unknown Customer'}</TableCell>
                  <TableCell>₹{booking.service?.price || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'destructive'}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
