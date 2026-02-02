"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PackageCard } from "@/components/PackageCard";

interface Package {
  _id: string;
  name: string;
  crop: string;
  duration: string;
  price: number;
  features: string[];
  description: string;
  provider: {
    name: string;
    email: string;
  };
}

export default function PackagesPage() {
  const { data: session, status } = useSession();

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCrop, setSelectedCrop] = useState("");
  const [searchProvider, setSearchProvider] = useState("");

  const crops = [
    "Rice",
    "Wheat",
    "Corn",
    "Soybean",
    "Cotton",
    "Sugarcane",
    "Potato",
    "Tomato",
    "Onion",
    "Vegetables",
  ];

  const userRole = (session?.user as { role?: string })?.role;

  // Fetch Packages
  const fetchPackages = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCrop) params.append("crop", selectedCrop);
      if (searchProvider) params.append("provider", searchProvider);

      const response = await fetch(`/api/packages?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages || []);
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    fetchPackages();
  }, [session, status]);

  useEffect(() => {
    fetchPackages();
  }, [selectedCrop, searchProvider]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold text-green-600">
        Loading Packages...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="max-w-7xl mx-auto py-10 px-6">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-green-700">
            🌱 Farming Packages
          </h1>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            Complete farming solutions with expert guidance and support.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-10 bg-white border border-green-200 rounded-3xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-green-700 mb-4">
            🔍 Filter Packages
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Crop */}
            <div>
              <label htmlFor="crop-select" className="block text-sm font-medium text-gray-700">
                Crop Type
              </label>

              <select
                id="crop-select"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="mt-2 w-full rounded-xl border border-green-300 px-4 py-3 shadow-sm focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Crops</option>
                {crops.map((crop) => (
                  <option key={crop}>{crop}</option>
                ))}
              </select>
            </div>

            {/* Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Provider Name
              </label>

              <input
                value={searchProvider}
                onChange={(e) => setSearchProvider(e.target.value)}
                placeholder="Enter provider name..."
                className="mt-2 w-full rounded-xl border border-green-300 px-4 py-3 shadow-sm focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Packages Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg._id}
              name={pkg.name}
              crop={pkg.crop}
              duration={pkg.duration}
              price={`₹${pkg.price}`}
              features={pkg.features}
            />
          ))}
        </div>

        {/* Empty */}
        {packages.length === 0 && (
          <p className="text-center mt-12 text-gray-500 font-medium">
            No packages found 🚫
          </p>
        )}
      </div>
    </div>
  );
}
