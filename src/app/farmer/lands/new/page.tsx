'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { MapPin, Ruler, Droplets, IndianRupee, Calendar, Image as ImageIcon } from 'lucide-react';

export default function AddLandPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    state: '',
    district: '',
    village: '',
    sizeValue: '',
    sizeUnit: 'acre',
    soilType: '',
    waterAvailability: '',
    leasePrice: '',
    leaseDuration: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        title: formData.title,
        location: {
          state: formData.state,
          district: formData.district,
          village: formData.village,
        },
        size: {
          value: parseFloat(formData.sizeValue),
          unit: formData.sizeUnit,
        },
        soilType: formData.soilType,
        waterAvailability: formData.waterAvailability,
        leasePrice: parseFloat(formData.leasePrice),
        leaseDuration: formData.leaseDuration,
        images: [], // TODO: Implement image upload
      };

      const res = await fetch('/api/lands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/farmer/dashboard');
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add land');
      }
    } catch (error) {
      setError('An error occurred while adding the land');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!session || session.user.role !== 'farmer') {
    router.push('/auth/signin');
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Land Added Successfully!</h1>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Land</h1>
            <p className="text-gray-600">Fill in the details to list your land for leasing</p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">Land Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                    <span className="text-green-600">📝</span> Land Title *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Fertile Agricultural Land in Punjab"
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </motion.div>

                {/* Location */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" /> Location *
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      name="state"
                      type="text"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Input
                      name="district"
                      type="text"
                      required
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="District"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Input
                      name="village"
                      type="text"
                      required
                      value={formData.village}
                      onChange={handleInputChange}
                      placeholder="Village"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </motion.div>

                {/* Size */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-purple-600" /> Land Size *
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="sizeValue"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.sizeValue}
                      onChange={handleInputChange}
                      placeholder="Size value"
                      className="transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <Select onValueChange={(value) => handleSelectChange('sizeUnit', value)} defaultValue="acre">
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acre">Acre</SelectItem>
                        <SelectItem value="bigha">Bigha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>

                {/* Soil Type and Water Availability */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="soilType" className="text-sm font-medium flex items-center gap-2">
                      <span className="text-amber-600">🌱</span> Soil Type *
                    </Label>
                    <Input
                      id="soilType"
                      name="soilType"
                      type="text"
                      required
                      value={formData.soilType}
                      onChange={handleInputChange}
                      placeholder="e.g., Alluvial, Black, Red"
                      className="transition-all duration-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waterAvailability" className="text-sm font-medium flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-cyan-600" /> Water Availability *
                    </Label>
                    <Input
                      id="waterAvailability"
                      name="waterAvailability"
                      type="text"
                      required
                      value={formData.waterAvailability}
                      onChange={handleInputChange}
                      placeholder="e.g., Well, Canal, Rain-fed"
                      className="transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                </motion.div>

                {/* Lease Price and Duration */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="leasePrice" className="text-sm font-medium flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-green-600" /> Lease Price (₹) *
                    </Label>
                    <Input
                      id="leasePrice"
                      name="leasePrice"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.leasePrice}
                      onChange={handleInputChange}
                      placeholder="Monthly lease price"
                      className="transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leaseDuration" className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-600" /> Lease Duration *
                    </Label>
                    <Input
                      id="leaseDuration"
                      name="leaseDuration"
                      type="text"
                      required
                      value={formData.leaseDuration}
                      onChange={handleInputChange}
                      placeholder="e.g., 1 year, 6 months"
                      className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </motion.div>



                {/* Image Upload Placeholder */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2"
                >
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gray-600" /> Land Images
                  </Label>
                  <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors duration-200">
                    <div className="text-gray-500">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-1 text-sm">Image upload coming soon...</p>
                      <p className="text-xs text-gray-400 mt-1">Upload high-quality images of your land</p>
                    </div>
                  </div>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-red-600 text-sm bg-red-50 border border-red-200 p-4 rounded-lg flex items-center gap-2"
                  >
                    <span className="text-red-500">⚠️</span> {error}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex justify-end space-x-4 pt-4"
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/farmer/dashboard')}
                    className="px-6 py-2 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding Land...
                      </div>
                    ) : (
                      'Add Land'
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
