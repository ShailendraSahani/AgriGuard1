'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';


interface Land {
  _id: string;
  title: string;
  location: { state: string; district: string; village: string };
  geometry?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  centroid?: {
    type: 'Point';
    coordinates: number[];
  };
  size: { value: number; unit: string };
  soilType: string;
  waterAvailability: string;
  leasePrice: number;
  leaseDuration: string;
  images: string[];
  availabilityStatus: string;
  farmer: { name: string; email: string; profile?: { location?: string; contact?: string } };
  description?: string;
}

export default function LandDetails() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [land, setLand] = useState<Land | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    fetchLand();
  }, [id]);

  const fetchLand = async () => {
    try {
      const response = await fetch(`/api/lands/${id}`);
      if (response.ok) {
        const data = await response.json();
        setLand(data);
      } else {
        console.error('Failed to fetch land');
      }
    } catch (error) {
      console.error('Error fetching land:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaseRequest = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setRequesting(true);
    try {
      const response = await fetch('/api/lease-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          land: id,
        }),
      });

      if (response.ok) {
        alert('Lease request submitted successfully!');
        // Redirect based on user role
        if (session.user.role === 'farmer') {
          router.push('/farmer/dashboard');
        } else {
          router.push('/lands'); // Redirect users back to lands page
        }
      } else {
        const error = await response.json();
        alert(`Failed to submit request: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting lease request:', error);
      alert('Failed to submit lease request');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!land) return <div className="min-h-screen flex items-center justify-center">Land not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Image Gallery */}
          <div className="aspect-w-16 aspect-h-9 bg-gray-200">
            {land.images.length > 0 ? (
              <img
                src={land.images[0]}
                alt={land.title}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500">No Image Available</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{land.title}</h1>
                <p className="text-lg text-gray-600">
                  {land.location.state}, {land.location.district}, {land.location.village}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">₹{land.leasePrice}</p>
                <p className="text-sm text-gray-500">per {land.leaseDuration}</p>
              </div>
            </div>

            {/* Land Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Land Specifications</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Size:</span> {land.size.value} {land.size.unit}</p>
                  <p><span className="font-medium">Soil Type:</span> {land.soilType}</p>
                  <p><span className="font-medium">Water Availability:</span> {land.waterAvailability}</p>
                  <p><span className="font-medium">Lease Duration:</span> {land.leaseDuration}</p>
                  <p><span className="font-medium">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      land.availabilityStatus === 'available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {land.availabilityStatus}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Farmer Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {land.farmer?.name || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {land.farmer?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {land.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700">{land.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {land.availabilityStatus === 'available' && session && (
                <button
                  onClick={handleLeaseRequest}
                  disabled={requesting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-yellow-500 text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {requesting ? 'Submitting...' : 'Lease Now'}
                </button>
              )}
              {!session && land.availabilityStatus === 'available' && (
                <Link
                  href="/auth/signin"
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 text-center"
                >
                  Sign In to Lease
                </Link>
              )}
              <Link
                href="/lands"
                className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back to Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
