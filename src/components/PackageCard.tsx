'use client';

import { motion } from 'framer-motion';
import { Check, Clock, Sprout, Star, Award, Zap } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PackageCardProps {
  name: string;
  crop: string;
  duration: string;
  price: string;
  features: string[];
}

export function PackageCard({ name, crop, duration, price, features }: PackageCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="hover-lift"
    >
      <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-modern overflow-hidden border-0 h-full relative">
        {/* Premium Badge */}
        <div className="absolute top-4 right-4 glass rounded-full px-3 py-1 flex items-center text-sm font-bold text-yellow-700 bg-yellow-100/80">
          <Star className="h-3 w-3 mr-1" />
          Premium
        </div>

        <CardHeader className="p-8 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">{name}</h3>
              <div className="flex items-center text-green-600 mb-2">
                <Sprout className="h-4 w-4 mr-2" />
                <span className="font-medium">{crop}</span>
              </div>
              <div className="flex items-center text-yellow-700">
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-medium">{duration}</span>
              </div>
            </div>
            <div className="glass rounded-xl px-4 py-2 flex items-center">
              <Zap className="h-4 w-4 mr-1 text-green-600" />
              <span className="text-2xl font-bold text-green-700">{price}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <ul className="text-sm text-gray-600 mb-6 space-y-3">
            {features.map((feature, index) => (
              <motion.li
                key={index}
                className="flex items-center"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-green-100 rounded-full p-1 mr-3">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="p-8 pt-0">
          <Button
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-6 rounded-full font-bold shadow-modern hover:shadow-modern-lg transition-modern transform hover:scale-105"
          >
            Start Farming
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
