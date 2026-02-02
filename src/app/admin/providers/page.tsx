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
import { Wrench, Plus } from 'lucide-react';
import Modal from '@/components/ui/modal';
import AddUserForm from '@/components/admin/AddUserForm';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProvidersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [providers, setProviders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const users: User[] = await res.json();
        setProviders(users.filter(user => user.role === 'provider'));
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
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
    fetchProviders();
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
        <h1 className="text-3xl font-bold text-gray-900">Service Providers Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Provider
          </Button>
          <PDFExport data={providers as unknown as Record<string, unknown>[]} title="Providers Report" filename="providers_report" />
        </div>
      </div>

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-green-600 flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Service Providers ({providers.length})
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
              {providers.map(provider => (
                <TableRow key={provider._id}>
                  <TableCell className="font-medium">{provider.name}</TableCell>
                  <TableCell>{provider.email}</TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Provider">
        <AddUserForm
          role="provider"
          onSuccess={() => {
            setIsModalOpen(false);
            fetchProviders();
          }}
        />
      </Modal>
    </motion.div>
  );
}
