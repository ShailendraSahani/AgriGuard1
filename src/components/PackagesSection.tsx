'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { PackageCard } from './PackageCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useSWR from 'swr';

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
  };
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function PackagesSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, error, isLoading } = useSWR('/api/packages?limit=6', fetcher, { refreshInterval: 5000 });

  const packages: Package[] = data?.packages || [];

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.crop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-green-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              className="animate-spin rounded-full h-16 w-16 border-4 border-green-700 border-t-yellow-700 mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-extrabold text-green-800 mb-6 gradient-text">
            Farming Packages
          </h2>
          <p className="text-xl text-green-400 mb-10 max-w-2xl mx-auto">
            Complete farming solutions with expert guidance and support
          </p>
          <div className="max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              <Input
                type="text"
                placeholder="Search packages by name or crop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 shadow-modern transition-modern bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {filteredPackages.slice(0, 6).map((pkg, index) => (
            <motion.div
              key={pkg._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <PackageCard
                name={pkg.name}
                crop={pkg.crop}
                duration={pkg.duration}
                price={`₹${pkg.price}`}
                features={pkg.features}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Link href="/packages">
            <Button
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-400 text-white px-10 py-4 rounded-xl font-bold shadow-modern-lg hover:shadow-modern-lg transition-modern transform hover:scale-105"
            >
              View All Packages
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
