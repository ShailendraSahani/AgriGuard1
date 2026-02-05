'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AddServiceForm from '@/components/provider/AddServiceForm';
import Modal from '@/components/ui/modal';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';

interface Service {
  _id: string;
  name: string;
  category: string;
  price: number;
  serviceArea: string;
  status: string;
  createdAt: string;
}

interface Booking {
  _id: string;
  service?: {
    name: string;
  };
  farmer?: {
    name: string;
  };
  status: string;
  bookingDate: string;
  totalAmount: number;
  createdAt: string;
}

export default function ProviderDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    } else {
      fetchProviderData();
    }
  }, [session, status, router]);

  const fetchProviderData = async () => {
    try {
      const [servicesRes, bookingsRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/bookings')
      ]);

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData.services || []);
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      }
    } catch (error) {
      console.error('Error fetching provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-500 to-yellow-500">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back, {session.user?.name}! Manage your services and bookings.
          </p>
        </div>

        {/* Notifications Panel */}
        <div className="mb-8">
          <NotificationPanel />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setShowAddServiceModal(true)}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Add Service</h3>
              <p className="mt-2 text-sm text-gray-600">Create new farming services</p>
            </div>
          </button>

          <Link
            href="/provider/bookings"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11M9 11h6" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Manage Bookings</h3>
              <p className="mt-2 text-sm text-gray-600">View and manage bookings</p>
            </div>
          </Link>

          <Link
            href="/provider/analytics"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Analytics</h3>
              <p className="mt-2 text-sm text-gray-600">View performance metrics</p>
            </div>
          </Link>
        </div>

        {/* Add Service Modal */}
        <Modal
          isOpen={showAddServiceModal}
          onClose={() => setShowAddServiceModal(false)}
          title="Add New Service"
        >
          <AddServiceForm onSuccess={() => {
            setShowAddServiceModal(false);
            fetchProviderData();
          }} />
        </Modal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Services */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">My Services</h3>
              {services.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {services.slice(0, 5).map((service) => (
                    <li key={service._id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {service.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {service.category} • {service.serviceArea}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">₹{service.price}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            service.status === 'available'
                              ? 'bg-green-500 text-white'
                              : service.status === 'booked'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {service.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">No services listed yet</p>
              )}
              <div className="mt-4">
                <Link
                  href="/provider/services"
                  className="text-green-500 hover:text-green-600 text-sm font-medium"
                >
                  Manage services →
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Bookings</h3>
              {bookings.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {bookings.slice(0, 5).map((booking) => (
                    <li key={booking._id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.service?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.farmer?.name} • {new Date(booking.bookingDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">₹{booking.totalAmount}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'confirmed'
                              ? 'bg-green-500 text-white'
                              : booking.status === 'pending'
                              ? 'bg-yellow-500 text-black'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">No bookings yet</p>
              )}
              <div className="mt-4">
                <Link
                  href="/provider/bookings"
                  className="text-green-500 hover:text-green-600 text-sm font-medium"
                >
                  View all bookings →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Service Management Section */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Service Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <svg className="mx-auto h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <h4 className="mt-2 text-sm font-medium text-gray-900">Add Service</h4>
                <p className="mt-1 text-xs text-gray-500">Create new offerings</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <svg className="mx-auto h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h4 className="mt-2 text-sm font-medium text-gray-900">Edit Services</h4>
                <p className="mt-1 text-xs text-gray-500">Update service details</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <svg className="mx-auto h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h4 className="mt-2 text-sm font-medium text-gray-900">View Analytics</h4>
                <p className="mt-1 text-xs text-gray-500">Track performance</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <svg className="mx-auto h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h4 className="mt-2 text-sm font-medium text-gray-900">Customer Support</h4>
                <p className="mt-1 text-xs text-gray-500">Manage inquiries</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
