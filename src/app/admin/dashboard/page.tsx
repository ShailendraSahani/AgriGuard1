'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '@/contexts/SocketContext';
import { StatsCards } from '@/components/admin/StatsCards';
import { Charts } from '@/components/admin/Charts';
import { PDFExport } from '@/components/admin/PDFExport';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import AddPackageForm from '@/components/admin/AddPackageForm';
import { Users, Wrench, MapPin, Package as PackageIcon, Calendar, Activity } from 'lucide-react';
import { IPackage } from '@/models/Package';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
}

interface Land {
  _id: string;
  title: string;
  location: {
    state: string;
    district: string;
    village: string;
  };
  size: { value: number; unit: string };
  leasePrice: number;
}

interface Package {
  _id: string;
  name: string;
  crop: string;
  price: number;
}

interface LeaseRequest {
  _id: string;
  status: string;
  land: { title: string };
  requester: { name: string };
}

interface Booking {
  _id: string;
  service?: { name: string; price: number };
  customer?: { name: string };
  farmer?: { name: string };
  status: string;
}

interface Provider {
  _id: string;
  name: string;
  email: string;
  role: string;
  services?: string[];
}

interface Farmer {
  _id: string;
  name: string;
  email: string;
  role: string;
  lands?: string[];
}

interface DashboardStats {
  totalFarmers: number;
  totalProviders: number;
  totalLandOwners: number;
  totalProducts: number;
  totalBookings: number;
  totalRevenue: number;
}

interface ChartData {
  month: string;
  bookings?: number;
  revenue?: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('stats');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [currentEntity, setCurrentEntity] = useState('');
  const [editingItem, setEditingItem] = useState<User | Service | Land | Package | LeaseRequest | Booking | null>(null);
  const [formData, setFormData] = useState<Partial<User & Service & Land & Package & LeaseRequest & Booking>>({});
  const [providers, setProviders] = useState<Provider[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalFarmers: 0,
    totalProviders: 0,
    totalLandOwners: 0,
    totalProducts: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, servicesRes, landsRes, packagesRes, leaseRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/services'),
        fetch('/api/admin/lands'),
        fetch('/api/admin/packages'),
        fetch('/api/admin/lease-requests'),
        fetch('/api/admin/bookings'),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (servicesRes.ok) setServices(await servicesRes.json());
      if (landsRes.ok) setLands(await landsRes.json());
      if (packagesRes.ok) setPackages(await packagesRes.json());
      if (leaseRes.ok) setLeaseRequests(await leaseRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as { role: string })?.role !== 'admin') {
      router.push('/auth/signin');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router]);

  const handleCreate = (entity: string) => {
    setCurrentEntity(entity);
    setModalType('create');
    setEditingItem(null);
    setFormData({});
    setModalOpen(true);
  };

  const handleEdit = (entity: string, item: User | Service | Land | Package | LeaseRequest | Booking) => {
    setCurrentEntity(entity);
    setModalType('edit');
    setEditingItem(item);
    setFormData(item);
    setModalOpen(true);
  };

  const handleDelete = async (entity: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await fetch(`/api/admin/${entity}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const method = modalType === 'create' ? 'POST' : 'PUT';
      const url = modalType === 'create' ? `/api/admin/${currentEntity}` : `/api/admin/${currentEntity}/${editingItem!._id}`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to submit:', error);
    }
  };

  if (status === 'loading') return <div>Loading...</div>;

  if (!session || (session.user as { role: string })?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-green-800">Admin Dashboard</h1>
          <div className="mt-6">
            <div className="border-b border-green-200">
              <nav className="-mb-px flex space-x-8">
                {['stats', 'users', 'services', 'lands', 'packages', 'lease-requests', 'bookings'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-green-700 hover:border-green-300'
                    }`}
                  >
                    {tab.replace('-', ' ').toUpperCase()}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="mt-6">
            {activeTab === 'stats' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-green-800">Dashboard Overview</h2>
                  <PDFExport data={users as unknown as Record<string, unknown>[]} title="Users Report" filename="users_report" />
                </div>

                <StatsCards stats={{
                  totalFarmers: users.filter(u => u.role === 'farmer').length,
                  totalProviders: users.filter(u => u.role === 'provider').length,
                  totalLandOwners: lands.length,
                  totalProducts: packages.length,
                  totalBookings: bookings.length,
                  totalRevenue: bookings.reduce((sum, b) => sum + (b.service?.price || 0), 0)
                }} />

                <Charts />

                <Card className="rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-green-600 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {bookings.slice(0, 5).map((booking, index) => (
                        <motion.div
                          key={booking._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{booking.service?.name}</p>
                            <p className="text-sm text-gray-500">Booked by {booking.farmer?.name}</p>
                          </div>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-green-800">Users Management</h2>
                  <div className="flex gap-2">
                    <PDFExport data={users as unknown as Record<string, unknown>[]} title="Users List" filename="users_report" />
                    <Button onClick={() => handleCreate('users')} className="bg-green-500 hover:bg-green-600">
                      <Users className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>
                <Card className="rounded-2xl shadow-lg">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-green-600">
                        <TableRow>
                          <TableHead className="text-white font-semibold">Name</TableHead>
                          <TableHead className="text-white font-semibold">Email</TableHead>
                          <TableHead className="text-white font-semibold">Role</TableHead>
                          <TableHead className="text-white font-semibold">Status</TableHead>
                          <TableHead className="text-white font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user, index) => (
                          <TableRow key={user._id} className={index % 2 === 0 ? 'bg-white' : 'bg-yellow-50'}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{user.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="default">Active</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit('users', user)}>Edit</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete('users', user._id)}>Delete</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'services' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-green-800">Service Providers Management</h2>
                  <div className="flex gap-2">
                    <PDFExport data={services as unknown as Record<string, unknown>[]} title="Services Report" filename="services_report" />
                    <Button onClick={() => handleCreate('services')} className="bg-green-600 hover:bg-green-700">
                      <Wrench className="w-4 h-4 mr-2" />
                      Add Service
                    </Button>
                  </div>
                </div>
                <Card className="rounded-2xl shadow-lg">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-green-600">
                        <TableRow>
                          <TableHead className="text-white font-semibold">Name</TableHead>
                          <TableHead className="text-white font-semibold">Description</TableHead>
                          <TableHead className="text-white font-semibold">Price</TableHead>
                          <TableHead className="text-white font-semibold">Status</TableHead>
                          <TableHead className="text-white font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {services.map((service, index) => (
                          <TableRow key={service._id} className={index % 2 === 0 ? 'bg-white' : 'bg-yellow-50'}>
                            <TableCell className="font-medium">{service.name}</TableCell>
                            <TableCell>{service.description}</TableCell>
                            <TableCell>₹{service.price}</TableCell>
                            <TableCell>
                              <Badge variant="default">Active</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit('services', service)}>Edit</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete('services', service._id)}>Delete</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'lands' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-green-800">Lands Management</h2>
                  <div className="flex gap-2">
                    <PDFExport data={lands as unknown as Record<string, unknown>[]} title="Lands Report" filename="lands_report" />
                    <Button onClick={() => handleCreate('lands')} className="bg-green-600 hover:bg-green-700">
                      <MapPin className="w-4 h-4 mr-2" />
                      Add Land
                    </Button>
                  </div>
                </div>
                <Card className="rounded-2xl shadow-lg">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-green-600">
                        <TableRow>
                          <TableHead className="text-white font-semibold">Title</TableHead>
                          <TableHead className="text-white font-semibold">Location</TableHead>
                          <TableHead className="text-white font-semibold">Size</TableHead>
                          <TableHead className="text-white font-semibold">Lease Price</TableHead>
                          <TableHead className="text-white font-semibold">Status</TableHead>
                          <TableHead className="text-white font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lands.map((land, index) => (
                          <TableRow key={land._id} className={index % 2 === 0 ? 'bg-white' : 'bg-yellow-50'}>
                            <TableCell className="font-medium">{land.title}</TableCell>
                            <TableCell>{`${land.location.state}, ${land.location.district}, ${land.location.village}`}</TableCell>
                            <TableCell>{land.size.value} {land.size.unit}</TableCell>
                            <TableCell>₹{land.leasePrice}</TableCell>
                            <TableCell>
                              <Badge variant="default">Active</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit('lands', land)}>Edit</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete('lands', land._id)}>Delete</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'packages' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-green-800">Packages Management</h2>
                  <div className="flex gap-2">
                    <PDFExport data={packages as unknown as Record<string, unknown>[]} title="Packages Report" filename="packages_report" />
                    <Button onClick={() => handleCreate('packages')} className="bg-green-500 via-yellow-500 hover:bg-green-700">
                      <PackageIcon className="w-4 h-4 mr-2" />
                      Add Package
                    </Button>
                  </div>
                </div>
                <Card className="rounded-2xl shadow-lg">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-green-600">
                        <TableRow>
                          <TableHead className="text-white font-semibold">Name</TableHead>
                          <TableHead className="text-white font-semibold">Crop</TableHead>
                          <TableHead className="text-white font-semibold">Price</TableHead>
                          <TableHead className="text-white font-semibold">Status</TableHead>
                          <TableHead className="text-white font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {packages.map((pkg, index) => (
                          <TableRow key={pkg._id} className={index % 2 === 0 ? 'bg-white' : 'bg-yellow-50'}>
                            <TableCell className="font-medium">{pkg.name}</TableCell>
                            <TableCell>{pkg.crop}</TableCell>
                            <TableCell>₹{pkg.price}</TableCell>
                            <TableCell>
                              <Badge variant="default">Active</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit('packages', pkg)}>Edit</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete('packages', pkg._id)}>Delete</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'lease-requests' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-green-800">Lease Requests Management</h2>
                  <div className="flex gap-2">
                    <PDFExport data={leaseRequests as unknown as Record<string, unknown>[]} title="Lease Requests Report" filename="lease_requests_report" />
                    <Button onClick={() => handleCreate('lease-requests')} className="bg-green-600 hover:bg-green-700">
                      <Calendar className="w-4 h-4 mr-2" />
                      Add Lease Request
                    </Button>
                  </div>
                </div>
                <Card className="rounded-2xl shadow-lg">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-green-600">
                        <TableRow>
                          <TableHead className="text-white font-semibold">Land Title</TableHead>
                          <TableHead className="text-white font-semibold">Requester</TableHead>
                          <TableHead className="text-white font-semibold">Status</TableHead>
                          <TableHead className="text-white font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leaseRequests.map((request, index) => (
                          <TableRow key={request._id} className={index % 2 === 0 ? 'bg-white' : 'bg-yellow-50'}>
                            <TableCell className="font-medium">{request.land?.title || 'Unknown Land'}</TableCell>
                            <TableCell>{request.requester?.name || 'Unknown Requester'}</TableCell>
                            <TableCell>
                              <Badge variant={request.status === 'approved' ? 'default' : request.status === 'pending' ? 'secondary' : 'destructive'}>
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit('lease-requests', request)}>Edit</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete('lease-requests', request._id)}>Delete</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'bookings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-green-800">Bookings Management</h2>
                  <div className="flex gap-2">
                    <PDFExport data={bookings as unknown as Record<string, unknown>[]} title="Bookings Report" filename="bookings_report" />
                    <Button onClick={() => handleCreate('bookings')} className="bg-green-600 hover:bg-green-700">
                      <Activity className="w-4 h-4 mr-2" />
                      Add Booking
                    </Button>
                  </div>
                </div>
                <Card className="rounded-2xl shadow-lg">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-green-600">
                        <TableRow>
                          <TableHead className="text-white font-semibold">Service</TableHead>
                          <TableHead className="text-white font-semibold">Customer</TableHead>
                          <TableHead className="text-white font-semibold">Status</TableHead>
                          <TableHead className="text-white font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking, index) => (
                          <TableRow key={booking._id} className={index % 2 === 0 ? 'bg-white' : 'bg-yellow-50'}>
                            <TableCell className="font-medium">{booking.service?.name || 'Service Deleted'}</TableCell>
                            <TableCell>{booking.customer?.name || 'Unknown Customer'}</TableCell>
                            <TableCell>
                              <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'destructive'}>
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit('bookings', booking)}>Edit</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete('bookings', booking._id)}>Delete</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`${modalType === 'create' ? 'Create' : 'Edit'} ${currentEntity}`}>
        <div className="mt-4 space-y-4">
          {currentEntity === 'users' && (
            <>
              <Input
                placeholder="Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="Email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                placeholder="Role"
                value={formData.role || ''}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </>
          )}
          {currentEntity === 'services' && (
            <>
              <Input
                placeholder="Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                placeholder="Price"
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              />
            </>
          )}
          {currentEntity === 'lands' && (
            <>
              <Input
                placeholder="Title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Input
                placeholder="State"
                value={formData.location?.state || ''}
                onChange={(e) => setFormData({ ...formData, location: { state: e.target.value, district: formData.location?.district || '', village: formData.location?.village || '' } })}
              />
              <Input
                placeholder="District"
                value={formData.location?.district || ''}
                onChange={(e) => setFormData({ ...formData, location: { state: formData.location?.state || '', district: e.target.value, village: formData.location?.village || '' } })}
              />
              <Input
                placeholder="Village"
                value={formData.location?.village || ''}
                onChange={(e) => setFormData({ ...formData, location: { state: formData.location?.state || '', district: formData.location?.district || '', village: e.target.value } })}
              />
              <Input
                placeholder="Size Value"
                type="number"
                value={formData.size?.value || ''}
                onChange={(e) => setFormData({ ...formData, size: { value: parseFloat(e.target.value), unit: formData.size?.unit || '' } })}
              />
              <Input
                placeholder="Size Unit"
                value={formData.size?.unit || ''}
                onChange={(e) => setFormData({ ...formData, size: { value: formData.size?.value || 0, unit: e.target.value } })}
              />
              <Input
                placeholder="Lease Price"
                type="number"
                value={formData.leasePrice || ''}
                onChange={(e) => setFormData({ ...formData, leasePrice: parseFloat(e.target.value) })}
              />
            </>
          )}
          {currentEntity === 'packages' && (
            <AddPackageForm
              onSuccess={() => {
                setModalOpen(false);
                fetchData();
              }}
              initialData={modalType === 'edit' && editingItem ? (editingItem as unknown as Partial<IPackage>) : undefined}
            />
          )}
          {/* Add similar form fields for other entities */}
        </div>
        {currentEntity !== 'packages' && (
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
