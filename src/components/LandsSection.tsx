"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  IndianRupee,
  Search,
  Award,
  Sparkles,
} from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useSWR from "swr";

interface Land {
  _id: string;
  title: string;
  location: {
    state: string;
    district: string;
    village: string;
  };
  size: {
    value: number;
    unit: string;
  };
  leasePrice: number;
  description: string;
  images: string[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function LandsSection() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useSWR(
    "/api/lands/public?limit=6",
    fetcher,
    { refreshInterval: 5000 }
  );

  const lands: Land[] = data?.lands || [];

  const filteredLands = lands.filter(
    (land) =>
      land.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${land.location.state} ${land.location.district} ${land.location.village}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  /* ================================
     ✅ SKELETON LOADER
  ================================= */
  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-green-50 via-white to-yellow-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl overflow-hidden bg-white shadow-lg border border-green-100"
            >
              {/* Image Skeleton */}
              <div className="h-52 w-full bg-gradient-to-r from-green-100 via-green-200 to-yellow-100 animate-pulse" />

              {/* Content Skeleton */}
              <div className="p-6 space-y-4">
                <div className="h-5 w-3/4 rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-4 w-1/2 rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-4 w-full rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-4 w-5/6 rounded-lg bg-gray-200 animate-pulse" />

                {/* Button Skeleton */}
                <div className="h-12 w-full rounded-2xl bg-green-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 via-white to-yellow-50 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-200/40 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-200/40 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">

        {/* ================================
            ✅ HEADING + SEARCH
        ================================= */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent">
            Available Farmlands 🌾
          </h2>

          <p className="text-lg text-gray-600 mt-4 max-w-xl mx-auto">
            Explore verified premium farmlands with the best lease offers.
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto mt-10 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />

            <Input
              placeholder="Search by land title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                pl-14 py-4 rounded-2xl
                border border-green-200
                focus:ring-2 focus:ring-green-500
                shadow-md bg-white/80 backdrop-blur-lg
              "
            />
          </div>
        </motion.div>

        {/* ================================
            ✅ LAND CARDS GRID
        ================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredLands.slice(0, 6).map((land, index) => (
            <motion.div
              key={land._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              {/* ================================
                  ✅ Animated Gradient Border Wrapper
              ================================= */}
              <div className="relative rounded-3xl p-[2px] overflow-hidden">

                {/* Glow Border */}
                <div
                  className="
                    absolute inset-0 rounded-3xl
                    bg-gradient-to-r from-green-500 via-yellow-500 to-green-500
                    opacity-70 blur-lg
                    group-hover:opacity-100
                    animate-[spin_6s_linear_infinite]
                  "
                />

                {/* Actual Card */}
                <Card
                  className="
                    relative rounded-3xl overflow-hidden
                    bg-white/80 backdrop-blur-xl
                    border border-white/30
                    shadow-lg hover:shadow-2xl
                    transition-all duration-500
                  "
                >
                  {/* Verified Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 
                    bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                    <Award className="h-4 w-4" />
                    Verified
                  </div>

                  {/* Price Tag */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 
                    bg-yellow-400 text-black text-xs font-bold px-4 py-1 rounded-full shadow-md">
                    <IndianRupee className="h-4 w-4" />
                    {land.leasePrice}
                  </div>

                  {/* Image */}
                  <CardHeader className="p-0">
                    <div className="h-52 overflow-hidden relative">
                      {land.images?.length > 0 ? (
                        <img
                          src={land.images[0]}
                          alt={land.title}
                          className="w-full h-full object-cover 
                          group-hover:scale-110 transition duration-700"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-6xl">
                          🌾
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  </CardHeader>

                  {/* Content */}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-extrabold text-green-700 line-clamp-1">
                      {land.title}
                    </h3>

                    <p className="flex items-center text-sm text-gray-600 mt-2">
                      <MapPin className="h-4 w-4 mr-1 text-yellow-500" />
                      {land.location.village}, {land.location.district}
                    </p>

                    <p className="mt-4 text-yellow-600 font-bold text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      {land.size.value} {land.size.unit}
                    </p>

                    <p className="mt-3 text-gray-600 text-sm line-clamp-2">
                      {land.description}
                    </p>
                  </CardContent>

                  {/* Footer */}
                  <CardFooter className="p-6 pt-0">
                    <Link href={`/lands/${land._id}`} className="w-full">
                      <Button
                        className="
                          w-full rounded-2xl py-5 font-bold text-white
                          bg-gradient-to-r from-green-500 to-yellow-500
                          hover:from-green-600 hover:to-yellow-600
                          shadow-lg hover:shadow-2xl
                          transition-all duration-500
                        "
                      >
                        View Details 🚜
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <Link href="/lands">
            <Button
              size="lg"
              className="
                px-14 py-6 rounded-3xl font-extrabold text-lg
                text-white bg-gradient-to-r from-green-500 to-yellow-500
                hover:scale-105 transition duration-500
                shadow-2xl
              "
            >
              View All Lands 🌍
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
