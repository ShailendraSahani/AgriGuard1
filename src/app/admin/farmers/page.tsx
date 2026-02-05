'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PDFExport } from '@/components/admin/PDFExport';
import { MapPin, Plus } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function FarmersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { socket } = useSocket();
  const [farmers, setFarmers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFarmers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const users: User[] = await res.json();
        setFarmers(users.filter(user => user.role === 'farmer'));
      }
    } catch (error) {
      console.error('Failed to fetch farmers:', error);
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
    fetchFarmers();
  }, [session, status, router]);

  useEffect(() => {
    if (!socket) return;

    const handleDataUpdate = () => {
      fetchFarmers();
    };

    socket.on('dataUpdated', handleDataUpdate);

    return () => {
      socket.off('dataUpdated', handleDataUpdate);
    };
  }, [socket]);

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
        <h1 className="text-3xl font-bold text-gray-900">Farmers Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/admin/add-user')} className="bg-yellow-500 hover:bg-yellow-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Farmer
          </Button>
          <PDFExport data={farmers as unknown as Record<string, unknown>[]} title="Farmers Report" filename="farmers_report" />
        </div>
      </div>

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-green-600 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Farmers ({farmers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farmers.map(farmer => (
                <TableRow key={farmer._id}>
                  <TableCell className="font-medium">{farmer.name}</TableCell>
                  <TableCell>{farmer.email}</TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
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
