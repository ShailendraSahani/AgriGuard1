'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Lock, MapPin, Phone, Sprout, Eye, EyeOff, Wrench, Award, Briefcase } from 'lucide-react';

export default function ProviderSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    contact: '',
    servicesOffered: '',
    certifications: '',
    experienceYears: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: 'provider',
          experienceYears: parseInt(formData.experienceYears) || 0
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/auth/signin?role=provider');
      } else {
        alert(data.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background with gradient and animated elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-yellow-50">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-green-200/30 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-yellow-200/30 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-yellow-100 rounded-full mb-4 shadow-modern"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <Wrench className="h-8 w-8 text-green-600" />
          </motion.div>
          <h2 className="text-3xl font-extrabold gradient-text mb-2">
            Become a Provider
          </h2>
          <p className="text-green-700">
            Join AgriGuard as a service provider
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-2xl p-8 shadow-modern-lg"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <label htmlFor="name" className="block text-sm font-semibold text-green-800 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-modern shadow-modern"
                  placeholder="Enter your full name"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <label htmlFor="email" className="block text-sm font-semibold text-green-800 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-modern shadow-modern"
                  placeholder="Enter your email"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <label htmlFor="password" className="block text-sm font-semibold text-green-800 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-modern shadow-modern"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <label htmlFor="location" className="block text-sm font-semibold text-green-800 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-modern shadow-modern"
                  placeholder="Enter your location"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <label htmlFor="contact" className="block text-sm font-semibold text-green-800 mb-2">
                Contact Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                <input
                  id="contact"
                  name="contact"
                  type="tel"
                  required
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-modern shadow-modern"
                  placeholder="Enter your contact number"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              <label htmlFor="servicesOffered" className="block text-sm font-semibold text-green-800 mb-2">
                Services Offered
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                <input
                  id="servicesOffered"
                  name="servicesOffered"
                  type="text"
                  required
                  value={formData.servicesOffered}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-modern shadow-modern"
                  placeholder="e.g., Plowing, Harvesting, Irrigation"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <label htmlFor="certifications" className="block text-sm font-semibold text-green-800 mb-2">
                Certifications
              </label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                <input
                  id="certifications"
                  name="certifications"
                  type="text"
                  required
                  value={formData.certifications}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-modern shadow-modern"
                  placeholder="e.g., Organic Farming, Pesticide License"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
            >
              <label htmlFor="experienceYears" className="block text-sm font-semibold text-green-800 mb-2">
                Years of Experience
              </label>
              <div className="relative">
                <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                <input
                  id="experienceYears"
                  name="experienceYears"
                  type="number"
                  required
                  value={formData.experienceYears}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-modern shadow-modern"
                  placeholder="e.g., 8"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-6 rounded-xl font-bold shadow-modern-lg hover:shadow-modern-lg transition-modern transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <motion.div
                      className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Creating Account...
                  </div>
                ) : (
                  'Create Provider Account'
                )}
              </button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="mt-8 text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-green-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 backdrop-blur-sm text-green-700 rounded-full">
                  Already have an account?{' '}
                  <a
                    href="/auth/signin"
                    className="font-semibold text-yellow-600 hover:text-yellow-700 transition-colors"
                  >
                    Sign in
                  </a>
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
