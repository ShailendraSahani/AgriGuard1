'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '@/contexts/SocketContext';

interface Land {
  _id: string;
  title: string;
  location: { state: string; district: string; village: string };
  size: { value: number; unit: string };
  leasePrice: number;
  availabilityStatus: string;
}

interface LeaseRequest {
  _id: string;
  land: { title: string };
  requester: { name: string; email: string };
  status: string;
  requestedAt: string;
}

export default function FarmerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('lands');
  const [lands, setLands] = useState<Land[]>([]);
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequest[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [landsRes, requestsRes] = await Promise.all([
        fetch('/api/lands/my'),
        fetch('/api/lease-requests'),
      ]);
      if (landsRes.ok) {
        const landsData = await landsRes.json();
        setLands(landsData);
      }
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setLeaseRequests(requestsData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'farmer') {
      router.push('/auth/signin');
      return;
    }
    fetchData();
  }, [session, status, fetchData]);

  const handleAcceptReject = async (requestId: string, status: string) => {
    try {
      const response = await fetch(`/api/lease-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to update request:', error);
    }
  };

  if (status === 'loading') return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full"
      ></motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-4 py-6 sm:px-0"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-2">🌾 Farmer Dashboard</h1>
            <p className="text-yellow-700">Manage your lands and lease requests efficiently</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Lands</p>
                  <p className="text-2xl font-bold text-green-600">{lands.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500"
            >
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11M9 11h6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Lease Requests</p>
                  <p className="text-2xl font-bold text-yellow-600">{leaseRequests.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">₹{lands.reduce((sum, land) => sum + land.leasePrice, 0)}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500"
            >
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Lands</p>
                  <p className="text-2xl font-bold text-yellow-600">{lands.filter(land => land.availabilityStatus === 'available').length}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-1">
              <nav className="flex space-x-1">
                {[
                  { id: 'lands', label: 'My Lands', icon: '🌱' },
                  { id: 'requests', label: 'Lease Requests', icon: '📋' },
                  { id: 'history', label: 'Booking History', icon: '📅' },
                  { id: 'earnings', label: 'Earnings', icon: '💰' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-green-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-yellow-50 hover:text-yellow-700'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'lands' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-green-800">My Lands</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/farmer/lands/new')}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-lg"
                  >
                    + Add New Land
                  </motion.button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lands.map((land, index) => (
                    <motion.div
                      key={land._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{land.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            land.availabilityStatus === 'available'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {land.availabilityStatus}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>📍 {land.location.state}, {land.location.district}, {land.location.village}</p>
                          <p>📏 Size: {land.size.value} {land.size.unit}</p>
                          <p>💰 Price: ₹{land.leasePrice}/month</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div>
                <h2 className="text-2xl font-bold text-green-800 mb-6">Lease Requests</h2>
                <div className="space-y-4">
                  {leaseRequests.map((request, index) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{request.land.title}</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>👤 Requested by: {request.requester.name}</p>
                            <p>📧 Email: {request.requester.email}</p>
                            <p>📅 Requested on: {new Date(request.requestedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {request.status === 'pending' && (
                            <div className="flex space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAcceptReject(request._id, 'accepted')}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
                              >
                                Accept
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAcceptReject(request._id, 'rejected')}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                              >
                                Reject
                              </motion.button>
                            </div>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <div className="flex items-center mb-6">
                  <div className="text-4xl mr-4">📅</div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-800">Booking History</h2>
                    <p className="text-gray-600">Track your service bookings and transactions</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Sample booking history - in real app, this would come from API */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">Tractor Rental Service</h3>
                        <p className="text-sm text-gray-600">Booked on: Dec 15, 2024</p>
                        <p className="text-sm text-gray-600">Provider: John Doe</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Completed
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Duration: 2 days</span>
                      <span className="font-semibold text-green-600">₹2,400</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">Harvesting Service</h3>
                        <p className="text-sm text-gray-600">Booked on: Nov 28, 2024</p>
                        <p className="text-sm text-gray-600">Provider: Green Farms Ltd</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        In Progress
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Duration: 3 days</span>
                      <span className="font-semibold text-green-600">₹4,500</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">Soil Testing</h3>
                        <p className="text-sm text-gray-600">Booked on: Nov 10, 2024</p>
                        <p className="text-sm text-gray-600">Provider: AgriLab Services</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Completed
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Duration: 1 day</span>
                      <span className="font-semibold text-green-600">₹800</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-green-800 text-sm">Your booking history is now available! Real data will be populated as you make bookings.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'earnings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <div className="flex items-center mb-6">
                  <div className="text-4xl mr-4">💰</div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-800">Earnings Summary</h2>
                    <p className="text-gray-600">Track your income from land leases and service bookings</p>
                  </div>
                </div>

                {/* Earnings Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-500 rounded-full">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                        <p className="text-2xl font-bold text-green-600">₹{lands.reduce((sum, land) => sum + land.leasePrice, 0) * 12}</p>
                        <p className="text-xs text-gray-500">Annual potential</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-500 rounded-full">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Monthly Average</p>
                        <p className="text-2xl font-bold text-blue-600">₹{Math.round(lands.reduce((sum, land) => sum + land.leasePrice, 0))}</p>
                        <p className="text-xs text-gray-500">Per month</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-yellow-500 rounded-full">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                        <p className="text-2xl font-bold text-yellow-600">+12%</p>
                        <p className="text-xs text-gray-500">This month</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Earnings Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Monthly Earnings Chart Placeholder */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Earnings Trend</h3>
                    <div className="h-64 flex items-center justify-center bg-white rounded-lg border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-gray-500 text-sm">Earnings chart will be displayed here</p>
                        <p className="text-gray-400 text-xs mt-1">Real data visualization coming soon</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                    <div className="space-y-4">
                      {/* Sample transactions - in real app, this would come from API */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">Land Lease Payment</p>
                            <p className="text-sm text-gray-600">From: Rajesh Kumar</p>
                            <p className="text-xs text-gray-500">Dec 15, 2024</p>
                          </div>
                          <span className="text-lg font-bold text-green-600">+₹2,400</span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">Service Booking</p>
                            <p className="text-sm text-gray-600">Tractor Rental Service</p>
                            <p className="text-xs text-gray-500">Dec 10, 2024</p>
                          </div>
                          <span className="text-lg font-bold text-green-600">+₹1,800</span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">Land Lease Payment</p>
                            <p className="text-sm text-gray-600">From: Priya Sharma</p>
                            <p className="text-xs text-gray-500">Nov 28, 2024</p>
                          </div>
                          <span className="text-lg font-bold text-green-600">+₹3,200</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Earnings Insights */}
                <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Earnings Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <h4 className="font-medium text-gray-900">Top Performing Land</h4>
                      </div>
                      <p className="text-sm text-gray-600">Your 5-acre plot in Punjab generates the highest returns with ₹2,400/month.</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="font-medium text-gray-900">Peak Season Alert</h4>
                      </div>
                      <p className="text-sm text-gray-600">Winter season shows 25% higher booking rates. Consider increasing rates during peak months.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-green-800 text-sm">Your earnings dashboard is now live! Real transaction data will populate as you receive payments.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
