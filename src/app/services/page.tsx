"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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

export default function ServicesPage() {
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
        setServices(data.services || []);
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

  // Book Service
  const handleBookService = async (serviceId: string) => {
    try {
      const bookingDate = new Date().toISOString().split('T')[0]; // Default to today
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId,
          bookingDate,
        }),
      });

      if (response.ok) {
        alert('Booking Request Sent Successfully ✅');
      } else {
        const errorData = await response.json();
        alert(`Booking Failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error booking service:', error);
      alert('An error occurred while booking the service. Please try again.');
    }
  };

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
      <div className="max-w-7xl mx-auto py-10 px-6">

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
              className="bg-white border border-green-200 rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden group"
            >
              <div className="p-7 space-y-4">

                {/* Title + Category */}
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-700 transition">
                    {service.name}
                  </h3>

                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    {service.category}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2">
                  {service.description}
                </p>

                {/* Price + Area */}
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-extrabold text-green-700">
                    ₹{service.price}
                  </span>
                  <span className="text-sm text-gray-500">
                    📍 {service.serviceArea}
                  </span>
                </div>

                {/* Provider */}
                <div className="text-sm text-gray-600">
                  <p>
                    Provider:{" "}
                    <span className="font-semibold text-gray-800">
                      {service.provider?.name}
                    </span>
                  </p>
                  {service.provider?.profile?.contact && (
                    <p>📞 {service.provider.profile.contact}</p>
                  )}
                </div>

                {/* Availability */}
                <p className="text-xs text-gray-500">
                  Available:{" "}
                  {service.availabilityDates?.start ? new Date(service.availabilityDates.start).toLocaleDateString() : 'N/A'}{" "}
                  -{" "}
                  {service.availabilityDates?.end ? new Date(service.availabilityDates.end).toLocaleDateString() : 'N/A'}
                </p>

                {/* Action Button */}
                {userRole === "farmer" ? (
                  <button
                    onClick={() => handleBookService(service._id)}
                    className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                  >
                    Book Service 🚜
                  </button>
                ) : (
                  <button
                    onClick={() => handleDeleteService(service._id)}
                    className="w-full py-3 rounded-xl border border-red-300 text-red-600 font-semibold hover:bg-red-50 transition"
                  >
                    Delete Service ❌
                  </button>
                )}
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
