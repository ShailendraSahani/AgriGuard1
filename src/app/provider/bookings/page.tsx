'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';

interface Booking {
  _id: string;
  service: {
    name: string;
    category: string;
  };
  user: {
    name: string;
    email: string;
    contact: string;
  };
  provider: {
    _id: string;
  };
  status: string;
  bookingDate: string;
  totalAmount: number;
  createdAt: string;
  notes?: string;
}

export default function ProviderBookings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { socket } = useSocket();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    } else {
      fetchBookings();
    }
  }, [session, status, router]);

  useEffect(() => {
    if (!socket) return;

    const handleBookingCreated = (booking: Booking) => {
      // Add new booking to the list if it's for this provider
      if (booking.provider._id === session?.user?.id) {
        setBookings(prev => [booking, ...prev]);
      }
    };

    const handleBookingUpdated = (updatedBooking: Booking) => {
      // Update existing booking
      setBookings(prev => prev.map(booking =>
        booking._id === updatedBooking._id ? updatedBooking : booking
      ));
    };

    socket.on('bookingCreated', handleBookingCreated);
    socket.on('bookingUpdated', handleBookingUpdated);

    return () => {
      socket.off('bookingCreated', handleBookingCreated);
      socket.off('bookingUpdated', handleBookingUpdated);
    };
  }, [socket, session?.user?.id]);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings/my');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setBookings(bookings.map(booking =>
          booking._id === bookingId ? { ...booking, status: newStatus } : booking
        ));
      } else {
        alert('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('An error occurred while updating the booking status');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage your service bookings and customer requests.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="sm:hidden">
            <label htmlFor="filter-select" className="sr-only">Filter bookings</label>
            <select
              id="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'all', label: 'All Bookings', count: bookings.length },
                  { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
                  { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
                  { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
                  { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                      filter === tab.key
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredBookings.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <li key={booking._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11M9 11h6" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-sm font-medium text-gray-900">
                              {booking.service.name}
                            </h3>
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {booking.service.category}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            <p>Customer: {booking.user.name} ({booking.user.email})</p>
                            <p>Contact: {booking.user.contact}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-sm font-medium text-gray-900">₹{booking.totalAmount}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </div>
                        <div className="mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : booking.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {booking.notes}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 flex space-x-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'completed')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11M9 11h6" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' ? 'You haven\'t received any bookings yet.' : `No ${filter} bookings found.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
