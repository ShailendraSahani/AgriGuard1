'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Star, Wrench, MapPin, Award, Shield, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Provider {
  _id: string;
  name: string;
  email: string;
  servicesCount: number;
  landsCount: number;
  rating: number;
  location: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function ProvidersSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, error, isLoading } = useSWR('/api/providers?limit=6', fetcher, { refreshInterval: 5000 });

  const providers: Provider[] = data?.providers || [];

  const filteredProviders = providers.filter((provider: Provider) =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-green-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-yellow-500 mx-auto"
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
            Trusted Service Providers
          </h2>
          <p className="text-xl text-green-400 mb-10 max-w-2xl mx-auto">
            Connect with verified farming service providers
          </p>
          <div className="max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              <Input
                type="text"
                placeholder="Search providers by name or location..."
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
          {filteredProviders.map((provider, index) => (
            <motion.div
              key={provider._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="hover-lift"
            >
              <Card className="bg-white/90 backdrop-blur-sm rounded-full shadow-modern overflow-hidden border-0 h-full relative">
                {/* Top Rated Badge */}
                {provider.rating >= 4.5 && (
                  <div className="absolute top-4 left-4 glass rounded-full px-3 py-1 text-sm font-bold text-yellow-800 flex items-center bg-yellow-100/80">
                    <Award className="h-3 w-3 mr-1" />
                    Top Rated
                  </div>
                )}

                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center mb-6">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-green-100 to-yellow-100 rounded-full flex items-center justify-center mr-6 relative"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-green-500 font-bold text-2xl">
                        {provider.name.charAt(0)}
                      </span>
                      {/* Verified Checkmark */}
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                        <Shield className="h-3 w-3 text-white" />
                      </div>
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold text-green-800 mb-2">
                        {provider.name}
                      </h3>
                      <div className="flex items-center text-green-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="font-medium">{provider.location}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <div className="flex items-center justify-between mb-6">
                    <div className="glass rounded-xl px-4 py-2 flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-lg font-bold text-yellow-800">{provider.rating}</span>
                    </div>
                    <div className="flex items-center text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                      <Wrench className="h-4 w-4 mr-1" />
                      <span className="font-medium">
                        {provider.servicesCount} services • {provider.landsCount} lands
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <div className="flex justify-between items-center w-full">
                    <Link href={`/providers/${provider._id}`}>
                      <Button
                        variant="ghost"
                        className="text-green-500 hover:text-green-500 hover:bg-green-50 font-bold text-lg transition-modern"
                      >
                        View Profile
                      </Button>
                    </Link>
                    <Link href={`/contact/${provider._id}`}>
                      <Button
                        className="bg-yellow-500 hover:bg-yellow-500 text-white py-3 px-6 rounded-full font-bold shadow-modern hover:shadow-modern-lg transition-modern transform hover:scale-105"
                      >
                        Contact
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
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
          <Link href="/providers">
            <Button
              size="lg"
              className="bg-green-700 hover:bg-green-600 text-white px-10 py-4 rounded-full font-bold shadow-modern-lg hover:shadow-modern-lg transition-modern transform hover:scale-105"
            >
              View All Providers
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
