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
import { Package, Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/modal';
import AddPackageForm from '@/components/admin/AddPackageForm';
import { useSocket } from '@/contexts/SocketContext';
import { IPackage } from '@/models/Package';

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { socket } = useSocket();
  const [packages, setPackages] = useState<Partial<IPackage>[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Partial<IPackage> | undefined>(undefined);

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/admin/packages');
      if (res.ok) {
        setPackages(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this package?')) return;
    const res = await fetch(`/api/admin/packages/${id}`, { method: 'DELETE' });
    if (res.ok) fetchPackages();
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as { role: string })?.role !== 'admin') {
      router.push('/auth/signin');
      return;
    }
    fetchPackages();
  }, [session, status, router]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => fetchPackages();
    socket.on('packages-updated', refresh);
    return () => {
      socket.off('packages-updated', refresh);
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
        <h1 className="text-3xl font-bold text-gray-900">Marketplace Management</h1>
        <PDFExport data={packages as unknown as Record<string, unknown>[]} title="Packages Report" filename="packages_report" />
      </div>

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-green-600 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Packages ({packages.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Crop</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map(pkg => (
                <TableRow key={pkg._id?.toString()}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>{pkg.planType || 'FREE'}</TableCell>
                  <TableCell>{pkg.crop}</TableCell>
                  <TableCell>{pkg.durationDays ? `${pkg.durationDays} days` : '-'}</TableCell>
                  <TableCell>₹{pkg.price}</TableCell>
                  <TableCell>
                    <Badge variant={pkg.isActive ? 'default' : 'secondary'}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPackage(pkg);
                          setIsModalOpen(true);
                        }}
                        className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(pkg._id?.toString() || '')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingPackage(undefined);
            setIsModalOpen(true);
          }}
          className="bg-green-600 hover:bg-yellow-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Package
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPackage(undefined);
        }}
        title={editingPackage ? 'Edit Package' : 'Add New Package'}
      >
        <AddPackageForm
          initialData={editingPackage}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingPackage(undefined);
            fetchPackages();
          }}
        />
      </Modal>
    </motion.div>
  );
}
