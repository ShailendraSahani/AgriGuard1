'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { motion } from 'framer-motion';

import {
  Star,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';

interface Provider {
  _id: string;
  name: string;
  servicesCount: number;
  rating: number;
  location: string;
  image?: string;
  online?: boolean;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json());

export function ProvidersSection() {
  const [page, setPage] = useState(1);
  const limit = 8;

  const { data, isLoading } = useSWR(
    `/api/providers?page=${page}&limit=${limit}`,
    fetcher,
    { refreshInterval: 5000 }
  );

  const providers: Provider[] = data?.providers || [];
  const totalPages = data?.totalPages || 1;

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-green-50 to-yellow-50">
        <div className="text-center">
          <motion.div
            className="animate-spin rounded-full h-14 w-14 border-4 border-green-500 border-t-yellow-500 mx-auto"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="w-full px-4">

        {/* Heading */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-extrabold text-green-700">
            Trusted Providers 🌱
          </h2>

          <p className="text-lg text-gray-600 mt-3 max-w-xl mx-auto">
            Verified farming experts with online support & direct chat
          </p>
        </motion.div>

        {/* Providers Grid */}
        <div
          className="
            grid gap-6
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
          "
        >
          {providers.map((provider, index) => (
            <motion.div
              key={provider._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.03 }}
            >
              {/* Card */}
              <Card className="relative h-full rounded-2xl border border-green-200 bg-white/90 shadow-md hover:shadow-xl transition flex flex-col overflow-hidden">

                {/* Online Badge */}
                {provider.online && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow">
                    🟢 Online
                  </span>
                )}

                {/* Profile Image */}
                <div className="h-32 w-full bg-gradient-to-r from-green-500 to-yellow-500 flex justify-center items-center">
                  <img
                    src={
                      provider.image ||
                      'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
                    }
                    alt={provider.name}
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                </div>

                {/* Header */}
                <CardHeader className="p-5 text-center">
                  <h3 className="text-lg font-bold text-gray-800 flex justify-center items-center gap-1">
                    {provider.name}
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                  </h3>

                  <p className="text-sm text-gray-500 flex justify-center items-center mt-2">
                    <MapPin className="w-4 h-4 mr-1 text-green-500" />
                    {provider.location}
                  </p>
                </CardHeader>

                {/* Content */}
                <CardContent className="px-5 pb-4 flex-grow">
                  <div className="flex justify-between items-center">

                    {/* Rating */}
                    <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg text-sm font-semibold">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {provider.rating}
                    </span>

                    {/* Services */}
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold">
                      {provider.servicesCount} Services
                    </span>
                  </div>
                </CardContent>

                {/* Footer Buttons */}
                <CardFooter className="p-5 pt-0 flex gap-3">

                  {/* Profile Button */}
                  <Link href={`/providers/${provider._id}`} className="w-full">
                    <Button className="w-full rounded-full bg-green-500 hover:bg-yellow-500 hover:text-black font-bold">
                      View
                    </Button>
                  </Link>

                  {/* Direct Chat Button */}
                  <Link href={`/chat/${provider._id}`} className="w-full">
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-green-500 text-green-700 hover:bg-green-50 font-bold flex items-center gap-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pagination + View More */}
        <div className="flex justify-center items-center gap-4 mt-14">

          {/* Prev */}
          <Button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded-full bg-green-500 hover:bg-yellow-500 font-bold"
          >
            ← Prev
          </Button>

          <span className="font-semibold text-gray-700">
            Page {page} / {totalPages}
          </span>

          {/* Next */}
          <Button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-full bg-green-500 hover:bg-yellow-500 font-bold"
          >
            Next →
          </Button>
        </div>
      </div>
    </section>
  );
}
