'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Land {
  _id: string;
  title: string;
  location: { state: string; district: string; village: string };
  size: { value: number; unit: string };
  soilType: string;
  waterAvailability: string;
  leasePrice: number;
  leaseDuration: string;
  images: string[];
  availabilityStatus: string;
  farmer: { name: string };
}

export default function LandsMarketplace() {
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);

  useEffect(() => {
    fetchLands();
  }, []);

  const fetchLands = async () => {
    try {
      const response = await fetch('/api/lands');
      if (response.ok) {
        const data = await response.json();
        setLands(data.lands);
      }
    } catch (error) {
      console.error('Failed to fetch lands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaseRequest = async (landId: string) => {
    setRequesting(landId);
    try {
      const response = await fetch('/api/lease-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          land: landId,
        }),
      });

      if (response.ok) {
        alert('Lease request submitted successfully!');
        // Optionally refresh the lands list or update the land status
        fetchLands();
      } else {
        const error = await response.json();
        alert(`Failed to submit request: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting lease request:', error);
      alert('Failed to submit lease request');
    } finally {
      setRequesting(null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Land Lease Marketplace</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lands.filter(land => land.availabilityStatus === 'available').map((land) => (
              <div key={land._id} className="bg-white overflow-hidden shadow-lg rounded-2xl">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  {land.images.length > 0 ? (
                    <img
                      src={land.images[0]}
                      alt={land.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{land.title}</h3>
                  <p className="text-sm text-gray-500 mb-1">
                    {land.location.state}, {land.location.district}, {land.location.village}
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    Size: {land.size.value} {land.size.unit}
                  </p>
                  <p className="text-sm text-gray-500 mb-1">Soil: {land.soilType}</p>
                  <p className="text-sm text-gray-500 mb-1">Water: {land.waterAvailability}</p>
                  <p className="text-sm text-gray-500 mb-2">Duration: {land.leaseDuration}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">₹{land.leasePrice}</span>
                    <div className="flex gap-2">
                      <Link
                        href={`/lands/${land._id}`}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleLeaseRequest(land._id)}
                        disabled={requesting === land._id}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {requesting === land._id ? 'Requesting...' : 'Lease Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {lands.filter(land => land.availabilityStatus === 'available').length === 0 && (
            <p className="text-center text-gray-500 mt-8">No lands available for lease at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}
