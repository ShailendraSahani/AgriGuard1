'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PayNowButton from '@/components/PayNowButton';
import CropSuggestionAI from '@/components/CropSuggestionAI';

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
  centroid: { coordinates: [number, number] };
}

export default function LandsMarketplace() {
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);

  const [nearMeEnabled, setNearMeEnabled] = useState(false);
  const [radiusKm, setRadiusKm] = useState(10);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationError, setLocationError] = useState('');

  const [soilFilter, setSoilFilter] = useState('');
  const [waterFilter, setWaterFilter] = useState('');

  // Fetch Lands
  const fetchLands = async () => {
    try {
      const params = new URLSearchParams();

      if (nearMeEnabled && coords) {
        params.append('lat', coords.lat.toString());
        params.append('lng', coords.lng.toString());
        params.append('radiusKm', radiusKm.toString());
      }

      if (soilFilter) params.append('soilType', soilFilter);
      if (waterFilter) params.append('waterAvailability', waterFilter);

      const res = await fetch(`/api/lands?${params.toString()}`);
      const data = await res.json();

      setLands(data.lands || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLands();
  }, [nearMeEnabled, radiusKm, coords, soilFilter, waterFilter]);

  // Near Me Location
  const handleNearMe = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setNearMeEnabled(true);
      },
      () => {
        setLocationError('Location permission denied.');
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold">
        Loading Marketplace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white">
      <div className="w-full px-4 py-10">

        {/* HERO HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900">
            🌱 Land Lease Marketplace
          </h1>
          <p className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">
            Discover verified farmland near you, get AI crop suggestions, and pay instantly.
          </p>
        </div>

        {/* FILTER BAR */}
        <div className="mb-10 flex flex-wrap gap-3 items-center rounded-3xl 
        bg-white/70 backdrop-blur-xl border border-green-200 shadow-xl px-6 py-4">

          {/* Near Me */}
          <button
            onClick={handleNearMe}
            className="px-5 py-2 rounded-full font-semibold text-white
            bg-gradient-to-r from-yellow-500 to-green-500 shadow-md
            hover:scale-105 transition"
          >
            📍 Near Me
          </button>

          {/* Radius */}
          <label className="text-sm text-gray-700 flex items-center gap-2">
            Radius
            <input
              type="number"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-20 rounded-full border px-3 py-1 text-sm 
              focus:ring-2 focus:ring-green-400 outline-none"
            />
            km
          </label>

          {/* Soil */}
          <input
            value={soilFilter}
            onChange={(e) => setSoilFilter(e.target.value)}
            placeholder="🌾 Soil type"
            className="w-44 rounded-full border px-4 py-2 text-sm 
            focus:ring-2 focus:ring-yellow-400 outline-none"
          />

          {/* Water */}
          <input
            value={waterFilter}
            onChange={(e) => setWaterFilter(e.target.value)}
            placeholder="💧 Water source"
            className="w-52 rounded-full border px-4 py-2 text-sm 
            focus:ring-2 focus:ring-blue-300 outline-none"
          />

          {/* Clear */}
          <button
            onClick={() => {
              setSoilFilter('');
              setWaterFilter('');
              setNearMeEnabled(false);
              setCoords(null);
              setRadiusKm(10);
            }}
            className="ml-auto px-4 py-2 rounded-full text-xs text-white bg-gradient-to-r from-yellow-500 to-green-500 hover:scale-105 transition"
          >
            ✖ Clear Filters
          </button>
        </div>

        {/* LAND CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {lands
            .filter((l) => l.availabilityStatus === 'available')
            .map((land) => (
              <div
                key={land._id}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg 
                hover:shadow-2xl hover:-translate-y-2 transition duration-300"
              >
                {/* IMAGE */}
                <div className="relative">
                  {land.images.length > 0 ? (
                    <img
                      src={land.images[0]}
                      alt={land.title}
                      className="w-full h-56 object-cover group-hover:scale-110 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                      No Image
                    </div>
                  )}

                  {/* PRICE BADGE */}
                  <span
                    className="absolute top-4 right-4 bg-green-600 text-white 
                    px-4 py-1 rounded-full text-sm font-bold shadow-lg"
                  >
                    ₹{land.leasePrice}
                  </span>
                </div>

                {/* CONTENT */}
                <div className="p-6 space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {land.title}
                  </h3>

                  <p className="text-sm text-gray-500">
                    📍 {land.location.state}, {land.location.district}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                      🌾 {land.soilType}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                      💧 {land.waterAvailability}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">
                      ⏳ {land.leaseDuration}
                    </span>
                  </div>

                  {/* AI Suggestion */}
                  <div className="mt-3 rounded-2xl bg-gradient-to-r from-green-50 to-yellow-50 p-3">
                    <CropSuggestionAI soilType={land.soilType} />
                  </div>

                  {/* BUTTONS */}
                  <div className="flex gap-3 pt-4">
                    <Link
                      href={`/lands/${land._id}`}
                      className="flex-1 text-center rounded-xl
                      bg-gradient-to-r from-yellow-500 to-green-500 text-white py-2 font-semibold
                      hover:scale-105 transition"
                    >
                      View →
                    </Link>

                    <div className="flex-1">
                      <PayNowButton
                        landId={land._id}
                        amount={land.leasePrice}
                        onSuccess={() =>
                          alert('✅ Payment Successful! Lease Submitted.')
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* EMPTY */}
        {lands.filter((l) => l.availabilityStatus === 'available').length === 0 && (
          <p className="text-center text-gray-500 mt-12 text-lg">
            😢 No lands available right now.
          </p>
        )}
      </div>
    </div>
  );
}
