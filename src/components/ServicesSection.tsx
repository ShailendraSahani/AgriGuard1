"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  User,
  IndianRupee,
  Tag,
  Star,
  ArrowRight,
  X,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSocket } from "@/contexts/SocketContext";

/* ---------------- TYPES ---------------- */
interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  provider?: {
    name: string;
  };
  rating?: number;
  reviews?: number;
}

/* ---------------- FETCHER ---------------- */
const fetcher = (url: string) => fetch(url).then((res) => res.json());

/* ---------------- SKELETON LOADER ---------------- */
function ServiceSkeleton() {
  return (
    <div className="rounded-3xl border border-green-200 bg-white shadow-lg p-8 animate-pulse space-y-4">
      <div className="h-6 w-2/3 bg-gray-200 rounded-lg"></div>
      <div className="h-4 w-1/3 bg-gray-200 rounded-lg"></div>
      <div className="h-16 w-full bg-gray-200 rounded-xl"></div>
      <div className="flex justify-between">
        <div className="h-6 w-20 bg-gray-200 rounded-lg"></div>
        <div className="h-6 w-24 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="h-12 w-full bg-gray-200 rounded-2xl"></div>
    </div>
  );
}

/* ---------------- MODAL POPUP ---------------- */
function ServiceModal({
  service,
  onClose,
}: {
  service: Service;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative"
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-red-500"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>

        {/* CONTENT */}
        <h2 className="text-3xl font-extrabold text-green-800">
          {service.name}
        </h2>

        <p className="mt-3 text-gray-600 leading-relaxed">
          {service.description}
        </p>

        {/* CATEGORY */}
        <div className="flex items-center gap-2 mt-4 text-green-600 font-medium">
          <Tag className="h-4 w-4" />
          {service.category}
        </div>

        {/* RATING */}
        <div className="flex items-center gap-2 mt-5">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-gray-800">
            {service.rating || 4.5}
          </span>
          <span className="text-gray-500 text-sm">
            ({service.reviews || 120} Reviews)
          </span>
        </div>

        {/* PRICE */}
        <div className="mt-6 flex items-center gap-2 text-2xl font-extrabold text-green-700">
          <IndianRupee className="h-6 w-6" />
          {service.price}
        </div>

        {/* PROVIDER */}
        <p className="mt-2 text-gray-500">
          Provider:{" "}
          <span className="font-semibold">
            {service.provider?.name || "Unknown"}
          </span>
        </p>

        {/* ACTION */}
        <Link href={`/services/${service._id}`} className="block mt-8">
          <Button className="w-full rounded-2xl py-6 text-lg font-bold bg-gradient-to-r from-green-600 to-yellow-500 shadow-lg hover:opacity-90">
            Book Now 🚜
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */
export function ServicesSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { socket } = useSocket();

  // Initial data fetch
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await fetcher("/api/services/available?limit=6");
        setServices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleServicesUpdate = (data: any) => {
      console.log("Services updated:", data);
      // Refresh services data
      fetcher("/api/services/available?limit=6").then((newData) => {
        setServices(Array.isArray(newData) ? newData : []);
      });
    };

    socket.on('services-updated', handleServicesUpdate);

    return () => {
      socket.off('services-updated', handleServicesUpdate);
    };
  }, [socket]);

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.category &&
        service.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <section className="py-24 bg-gradient-to-br from-green-50 via-white to-yellow-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-extrabold text-green-800">
            🌱 Farming Services
          </h2>

          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Verified farming services with premium booking experience.
          </p>

          {/* SEARCH */}
          <div className="mt-10 max-w-xl mx-auto relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-green-400" />

            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 py-6 rounded-2xl border border-green-200 shadow-md bg-white/80 backdrop-blur-md focus:ring-4 focus:ring-green-300"
            />
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <ServiceSkeleton key={i} />
              ))
            : filteredServices.slice(0, 6).map((service, index) => (
                <motion.div
                  key={service._id}
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* CARD WITH ANIMATED BORDER */}
                  <div className="p-[2px] rounded-3xl bg-gradient-to-r from-green-400 via-yellow-400 to-green-400">
                    <Card className="rounded-3xl bg-white shadow-lg overflow-hidden">
                      <CardHeader className="p-8">
                        <h3 className="text-2xl font-bold text-green-800">
                          {service.name}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                          <Tag className="h-4 w-4" />
                          {service.category}
                        </div>
                      </CardHeader>

                      <CardContent className="px-8 space-y-4">
                        <p className="text-gray-600 line-clamp-3">
                          {service.description}
                        </p>

                        {/* RATING */}
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold">
                            {service.rating || 4.5}
                          </span>
                          <span className="text-gray-400 text-sm">
                            ({service.reviews || 120})
                          </span>
                        </div>

                        {/* PRICE */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1 text-xl font-extrabold text-green-700">
                            <IndianRupee className="h-5 w-5" />
                            {service.price}
                          </div>

                          <div className="flex items-center text-gray-500 text-sm gap-1">
                            <User className="h-4 w-4" />
                            {service.provider?.name || "Unknown"}
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="p-8 flex gap-3">
                        <Button
                          variant="outline"
                          className="w-1/2 rounded-2xl border-green-300 text-green-700"
                          onClick={() => setSelectedService(service)}
                        >
                          Details
                        </Button>

                        <Link
                          href={`/services/${service._id}`}
                          className="w-1/2"
                        >
                          <Button className="w-full rounded-2xl bg-gradient-to-r from-green-600 to-yellow-500 text-white font-bold">
                            Book <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </div>
                </motion.div>
              ))}
        </div>

        {/* MODAL */}
        {selectedService && (
          <ServiceModal
            service={selectedService}
            onClose={() => setSelectedService(null)}
          />
        )}
      </div>


    </section>
  );
}
