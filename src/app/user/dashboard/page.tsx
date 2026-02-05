'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSocket } from '@/contexts/SocketContext';

// ✅ Recharts (SSR safe)
const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false }
);

const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const LineChart = dynamic(() => import('recharts').then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });

// ---------------- TYPES ----------------
interface AnalyticsData {
  cropData: Array<{ week: string; growth: number }>;
}

interface BookingData {
  _id: string;
  service: {
    name: string;
    category: string;
    price: number;
  };
  provider: {
    name: string;
    email: string;
  };
  status: string;
  bookingDate: string;
  workStartDate?: string;
  workEndDate?: string;
  totalAmount?: number;
  paymentStatus?: string;
}

interface LeaseRequestData {
  _id: string;
  land: {
    _id: string;
    title: string;
    location: {
      state: string;
      district: string;
      village: string;
    };
    size: {
      value: number;
      unit: 'acre' | 'bigha';
    };
    price: number;
  };
  status: string;
  requestedAt: string;
  respondedAt?: string;
}

// ---------------- COMPONENT ----------------
export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { socket } = useSocket();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequestData[]>([]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // 📊 Analytics
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/user/analytics');
        if (!res.ok) throw new Error('Analytics API failed');
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      }
    };

    // 📅 Bookings
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/bookings/my');
        if (!res.ok) throw new Error('Bookings API failed');
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error(err);
      }
    };

    // 🏠 Lease Requests
    const fetchLeaseRequests = async () => {
      try {
        const res = await fetch('/api/lease-requests/my');
        if (!res.ok) throw new Error('Lease Requests API failed');
        const data = await res.json();
        setLeaseRequests(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAnalytics();
    fetchBookings();
    fetchLeaseRequests();
  }, [session, status, router]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleBookingUpdate = (data: any) => {
      console.log('Booking update:', data);
      // Refresh bookings
      fetch('/api/bookings/my')
        .then(res => res.json())
        .then(data => setBookings(data))
        .catch(err => console.error(err));
    };

    const handleLeaseUpdate = (data: any) => {
      console.log('Lease update:', data);
      // Refresh lease requests
      fetch('/api/lease-requests/my')
        .then(res => res.json())
        .then(data => setLeaseRequests(data))
        .catch(err => console.error(err));
    };

    socket.on('booking-update', handleBookingUpdate);
    socket.on('lease-update', handleLeaseUpdate);

    return () => {
      socket.off('booking-update', handleBookingUpdate);
      socket.off('lease-update', handleLeaseUpdate);
    };
  }, [socket]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-green-600 font-bold">
        Loading Dashboard...
      </div>
    );
  }



  const cropData =
    analytics?.cropData ?? [
      { week: 'Week 1', growth: 0 },
      { week: 'Week 2', growth: 0 },
      { week: 'Week 3', growth: 0 },
      { week: 'Week 4', growth: 0 },
    ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white">
      <div className="max-w-7xl mx-auto py-6 px-4">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
              Welcome,{' '}
              <span className="text-green-600">
                {session?.user?.name}
              </span>{' '}
              👨‍🌾
            </h1>
            <p className="text-gray-500 mt-2">
              Smart Farming Dashboard Overview
            </p>
          </div>

          <Link href="/bookings/new">
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold shadow-lg hover:scale-105 transition w-full sm:w-auto">
              + New Booking
            </button>
          </Link>
        </div>

        {/* PROFILE */}
        <div className="mb-10">
          <div className="p-6 rounded-2xl bg-white shadow-lg border">
            <h2 className="text-xl font-bold text-green-700">
              Farmer Profile 🧑‍🌾
            </h2>
            <p className="mt-3 text-gray-600">
              Name: {session?.user?.name}
            </p>
            <p className="text-gray-600">Role: {session?.user?.role ? session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1) : 'User'}</p>
            <p className="text-gray-600">
              Location:{' '}
              {(() => {
                const loc = (session?.user as any)?.location;
                if (typeof loc === 'string') return loc;
                if (loc && typeof loc === 'object') {
                  if (typeof loc.value === 'string') return loc.value;
                  if (loc.state || loc.district || loc.village) {
                    return `${loc.state || ''}, ${loc.district || ''}, ${loc.village || ''}`.trim().replace(/^,|,$/g, '');
                  }
                }
                return 'Delhi, India';
              })()}
            </p>
          </div>
        </div>

        {/* CHARTS */}
        <div className="mb-10">
          <div className="p-6 rounded-2xl bg-white shadow-lg border">
            <h2 className="text-xl font-bold text-yellow-600 mb-4">
              Crop Growth 🌾
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={cropData}>
                <XAxis dataKey="week" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="growth"
                  stroke="#eab308"
                  strokeWidth={4}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MY BOOKINGS */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-green-700 mb-6">
            My Bookings 📅
          </h2>
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No bookings found. Start by booking a service!
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <div key={booking._id} className="p-6 rounded-2xl bg-white shadow-lg border">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      {booking.service.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Provider: {booking.provider.name}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Booked: {new Date(booking.bookingDate).toLocaleDateString()}
                  </p>
                  {booking.workStartDate && (
                    <p className="text-sm text-gray-600 mb-2">
                      Work Start: {new Date(booking.workStartDate).toLocaleDateString()}
                    </p>
                  )}
                  {booking.totalAmount && (
                    <p className="text-sm font-bold text-green-600 mb-2">
                      Amount: ₹{booking.totalAmount.toLocaleString()}
                    </p>
                  )}
                  {booking.paymentStatus && (
                    <p className="text-sm text-gray-600">
                      Payment: {booking.paymentStatus}
                    </p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Link href={`/bookings/${booking._id}`}>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition">
                        View Details
                      </button>
                    </Link>
                    {booking.status === 'pending' && (
                      <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MY LEASE REQUESTS */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">
            My Lease Requests 🏠
          </h2>
          {leaseRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No lease requests found. Browse available lands to lease!
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaseRequests.map((request) => (
                <div key={request._id} className="p-6 rounded-2xl bg-white shadow-lg border">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      {request.land.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Location: {typeof request.land.location === 'object'
                      ? `${request.land.location.state}, ${request.land.location.district}, ${request.land.location.village}`
                      : request.land.location}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Size: {request.land.size.value} {request.land.size.unit}
                  </p>
                  <p className="text-sm font-bold text-green-600 mb-2">
                    Price: ₹{request.land.price ? request.land.price.toLocaleString() : 'N/A'}/month
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Requested: {new Date(request.requestedAt).toLocaleDateString()}
                  </p>
                  {request.respondedAt && (
                    <p className="text-sm text-gray-600">
                      Responded: {new Date(request.respondedAt).toLocaleDateString()}
                    </p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Link href={`/lands/${request.land._id}`}>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition">
                        View Land
                      </button>
                    </Link>
                    {request.status === 'pending' && (
                      <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition">
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
