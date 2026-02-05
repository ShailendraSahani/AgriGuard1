'use client';

import { useState } from 'react';
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden w-screen">
      {/* 🌿 Background */}
      <div className="absolute inset-0 w-screen bg-gradient-to-br from-green-500 via-green-600 to-yellow-500">
        <div className="absolute inset-0 bg-black/25 backdrop-blur-2xl" />

        {/* Glow Orbs */}
        <motion.div
          className="absolute top-10 md:top-20 left-10 md:left-20 w-24 md:w-48 h-24 md:h-48 bg-green-400/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 md:bottom-20 right-10 md:right-20 w-32 md:w-64 h-32 md:h-64 bg-yellow-400/30 rounded-full blur-3xl"
          animate={{ scale: [1.3, 1, 1.3] }}
          transition={{ duration: 7, repeat: Infinity }}
        />

        {/* Floating Icons */}
        <motion.div
          className="absolute top-12 md:top-24 right-12 md:right-24 text-white/20"
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <Tractor className="h-8 md:h-16 w-8 md:w-16" />
        </motion.div>

        <motion.div
          className="absolute bottom-12 md:bottom-24 left-12 md:left-24 text-white/20"
          animate={{ y: [0, 25, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
        >
          <Users className="h-8 md:h-16 w-8 md:w-16" />
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-5 md:left-10 text-white/20"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        >
          <Award className="h-6 md:h-12 w-6 md:w-12" />
        </motion.div>

        <motion.div
          className="absolute top-1/3 right-5 md:right-10 text-white/20"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <Sparkles className="h-6 md:h-12 w-6 md:w-12" />
        </motion.div>
      </div>

      {/* 🌿 Content */}
      <div className="relative z-10 w-full px-4 text-center">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-2xl mb-6">
            AgriGuard
            <span className="block text-yellow-300">
              Online Farming Platform
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-12">
            Lease lands 🌾, book services 🚜 & explore smart farming packages 📦  
            — all powered by technology.
          </p>
        </motion.div>

        {/* 🔍 Search */}
        <motion.div
          className="max-w-3xl mx-auto mb-14"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
        >
          <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/30">
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
                    className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold transition-all duration-300 ${
                      searchType === type
                        ? 'bg-yellow-400 text-green-900 shadow-lg scale-105'
                        : 'text-white/80 hover:bg-white/15'
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
                  className="pl-12 pr-4 py-4 rounded-full bg-white text-green-700 font-medium shadow-md focus:ring-4 focus:ring-yellow-300"
                />
              </div>

              {/* Button */}
              <Button
                onClick={handleSearch}
                className="rounded-full bg-green-500 hover:bg-green-600 text-white px-10 py-4 font-bold shadow-xl hover:shadow-green-500/50 transition-all duration-300"
              >
                Search
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
