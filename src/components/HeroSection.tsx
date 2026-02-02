'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Wrench,
  Package,
  Tractor,
  Users,
  Award,
  Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function HeroSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] =
    useState<'lands' | 'services' | 'packages'>('lands');

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    const urls = {
      lands: `/lands?search=${encodeURIComponent(searchTerm)}`,
      services: `/services?search=${encodeURIComponent(searchTerm)}`,
      packages: `/packages?search=${encodeURIComponent(searchTerm)}`
    };

    window.location.href = urls[searchType];
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ✅ Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-green-600 to-yellow-500">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-3xl"></div>

        {/* Floating Glow Orbs */}
        <motion.div
          className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-56 h-56 bg-yellow-400/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 7, repeat: Infinity }}
        />

        {/* Floating Icons */}
        <motion.div
          className="absolute top-24 right-24 text-white/20"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <Tractor className="h-16 w-16" />
        </motion.div>

        <motion.div
          className="absolute bottom-24 left-24 text-white/20"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
        >
          <Users className="h-16 w-16" />
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-10 text-white/20"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        >
          <Award className="h-12 w-12" />
        </motion.div>

        <motion.div
          className="absolute top-1/3 right-10 text-white/20"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <Sparkles className="h-12 w-12" />
        </motion.div>
      </div>

      {/* ✅ Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-xl mb-6">
            AgriGuard-Online Farming
          </h1>

          <p className="text-lg md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-12">
            Lease lands 🌾, book services 🚜, and access farming packages 📦 —
            all in one powerful agriculture platform.
          </p>
        </motion.div>

        {/* ✅ Search Bar */}
        <motion.div
          className="max-w-3xl mx-auto mb-14"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
        >
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Selector */}
              <div className="flex gap-2">
                {[
                  { type: 'lands', icon: MapPin, label: 'Lands' },
                  { type: 'services', icon: Wrench, label: 'Services' },
                  { type: 'packages', icon: Package, label: 'Packages' }
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setSearchType(type as any)}
                    className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold transition-all ${
                      searchType === type
                        ? 'bg-yellow-400 text-green-900 shadow-lg'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="flex-1 relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                <Input
                  placeholder={`Search ${searchType}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 pr-4 py-4 rounded-full bg-white text-green-500 shadow-md focus:ring-4 focus:ring-yellow-300"
                />
              </div>

              {/* Button */}
              <Button
                onClick={handleSearch}
                className="rounded-full bg-green-500 hover:bg-green-700 px-8 py-4 font-bold shadow-xl"
              >
                Search
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ✅ Action Buttons */}
        
      </div>
    </section>
  );
}
