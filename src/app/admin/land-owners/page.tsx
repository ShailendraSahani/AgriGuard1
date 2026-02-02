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
import { MapPin, Plus } from 'lucide-react';
import Modal from '@/components/ui/modal';
import AddUserForm from '@/components/admin/AddUserForm';
import AddLandForm from '@/components/admin/AddLandForm';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function LandOwnersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [landOwners, setLandOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLandModalOpen, setIsLandModalOpen] = useState(false);

  const fetchLandOwners = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const users: User[] = await res.json();
        setLandOwners(users.filter(user => user.role === 'land-owner'));
      }
    } catch (error) {
      console.error('Failed to fetch land owners:', error);
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
    fetchLandOwners();
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
        <h1 className="text-3xl font-bold text-gray-900">Land Owners Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Land Owner
          </Button>
          <Button onClick={() => setIsLandModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Land
          </Button>
          <PDFExport data={landOwners as unknown as Record<string, unknown>[]} title="Land Owners Report" filename="land_owners_report" />
        </div>
      </div>

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-green-600 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Land Owners ({landOwners.length})
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
              {landOwners.map(owner => (
                <TableRow key={owner._id}>
                  <TableCell className="font-medium">{owner.name}</TableCell>
                  <TableCell>{owner.email}</TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Land Owner">
        <AddUserForm
          role="land-owner"
          onSuccess={() => {
            setIsModalOpen(false);
            fetchLandOwners();
          }}
        />
      </Modal>

      <Modal isOpen={isLandModalOpen} onClose={() => setIsLandModalOpen(false)} title="Add New Land">
        <AddLandForm
          onSuccess={() => {
            setIsLandModalOpen(false);
            // Optionally refresh land data if needed
          }}
        />
      </Modal>
    </motion.div>
  );
}
