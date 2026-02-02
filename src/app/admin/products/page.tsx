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
import { Package, Plus } from 'lucide-react';
import Modal from '@/components/ui/modal';
import AddPackageForm from '@/components/admin/AddPackageForm';

interface PackageItem {
  _id: string;
  name: string;
  crop: string;
  price: number;
}

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as { role: string })?.role !== 'admin') {
      router.push('/auth/signin');
      return;
    }
    fetchPackages();
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
                <TableHead>Crop</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map(pkg => (
                <TableRow key={pkg._id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>{pkg.crop}</TableCell>
                  <TableCell>₹{pkg.price}</TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Package">
        <AddPackageForm
          onSuccess={() => {
            setIsModalOpen(false);
            fetchPackages();
          }}
        />
      </Modal>
    </motion.div>
  );
}
