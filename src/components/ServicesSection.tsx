"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import AddServiceForm from "@/components/provider/AddServiceForm";

interface Service {
  _id: string;
  name: string;
  category: string;
  price: number;
  serviceArea: string;
  availabilityDates: {
    start: string;
    end: string;
  };
  description: string;
  provider: {
    name: string;
    email: string;
    profile?: {
      location?: string;
      contact?: string;
    };
  };
}

export function ServicesSection() {
  const { data: session, status } = useSession();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchArea, setSearchArea] = useState("");

  const categories = [
    "Tractor Rental",
    "Harvesting",
    "Irrigation Setup",
    "Seed Supply",
    "Soil Testing",
    "Drone Spray",
    "Labor Supply",
  ];

  const categoryIcons: { [key: string]: string } = {
    "Tractor Rental": "🚜",
    "Harvesting": "🌾",
    "Irrigation Setup": "💧",
    "Seed Supply": "🌱",
    "Soil Testing": "🧪",
    "Drone Spray": "🚁",
    "Labor Supply": "👷",
  };

  const userRole = (session?.user as any)?.role;

  // Fetch Services
  const fetchServices = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchArea) params.append("area", searchArea);

      const response = await fetch(`/api/services/available?${params}`);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data || []);
      }
    } catch (error) {
      console.error("Failed provider services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (userRole === "provider") {
      fetchProviderServices();
    } else {
      fetchServices();
    }
  }, [session, status]);

  useEffect(() => {
    fetchServices();
  }, [selectedCategory, searchArea]);

  // Delete Service
  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure?")) return;

    await fetch(`/api/services/${serviceId}`, {
      method: "DELETE",
    });

    fetchProviderServices();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold text-green-600">
        Loading Services...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="w-full py-10 px-4">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-green-700">
            🌱 Available Services
          </h1>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            Browse and book verified farming services from trusted providers.
          </p>
        </div>

        {/* Provider Add Form */}
        {userRole === "provider" && (
          <div className="mb-10 bg-white border border-green-200 rounded-3xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-green-700 mb-4">
              ➕ Add New Service
            </h2>
            <AddServiceForm onSuccess={() => fetchProviderServices()} />
          </div>
        )}

        {/* Filters */}
        <div className="mb-10 bg-white border border-green-200 rounded-3xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-green-700 mb-4">
            🔍 Filter Services
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-2 w-full rounded-xl border border-green-300 px-4 py-3 shadow-sm focus:ring-2 focus:ring-green-500"
                aria-label="Select service category"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service Area
              </label>

              <input
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                placeholder="Enter location..."
                className="mt-2 w-full rounded-xl border border-green-300 px-4 py-3 shadow-sm focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Services Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-gradient-to-br from-white to-green-50 border border-green-500 rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-green-500/50 hover:scale-105 transition-all duration-500 overflow-hidden group animate-fade-in"
            >
              <div className="p-8 space-y-5">

                {/* Title + Category */}
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-extrabold text-gray-800 group-hover:text-green-700 transition-colors duration-300 leading-tight">
                    {service.name}
                  </h3>

                  <span className="px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm">
                    {categoryIcons[service.category]} {service.category}
                  </span>
                </div>

                {/* Description */}
                <p className="text-base text-gray-600 line-clamp-3 leading-relaxed">
                  {service.description}
                </p>

                {/* Price + Area */}
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-black text-green-700 drop-shadow-sm">
                    ₹{service.price}
                  </span>
                  <span className="text-base text-gray-500 font-medium">
                    📍 {service.serviceArea}
                  </span>
                </div>

                {/* Provider */}
                <div className="text-base text-gray-600 space-y-1">
                  <p className="flex items-center">
                    <span className="font-semibold text-gray-800 mr-2">👤</span>
                    Provider: <span className="font-bold text-gray-900 ml-1">{service.provider?.name}</span>
                  </p>
                  {service.provider?.profile?.contact && (
                    <p className="flex items-center">
                      <span className="mr-2">📞</span>
                      {service.provider.profile.contact}
                    </p>
                  )}
                </div>

                {/* Availability */}
                <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="font-medium">📅 Available:</span>{" "}
                  {service.availabilityDates?.start ? new Date(service.availabilityDates.start).toLocaleDateString() : 'N/A'}{" "}
                  -{" "}
                  {service.availabilityDates?.end ? new Date(service.availabilityDates.end).toLocaleDateString() : 'N/A'}
                </p>

                {/* Action Button */}
                <Link
                  href={`/services/${service._id}`}
                  className="block w-full text-center py-4 rounded-2xl bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold hover:from-green-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  🚜 Book Service
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty */}
        {services.length === 0 && (
          <p className="text-center mt-12 text-gray-500 font-medium">
            No services found 🚫
          </p>
        )}
      </div>
    </div>
  );
}
