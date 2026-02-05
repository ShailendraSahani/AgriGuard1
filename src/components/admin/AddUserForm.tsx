'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddUserFormProps {
  role: 'farmer' | 'provider' | 'land-owner';
  onSuccess: () => void;
}

export default function AddUserForm({ role, onSuccess }: AddUserFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    contact: '',
    verificationStatus: false,
    farmSize: '',
    crops: '',
    experienceYears: '',
    servicesOffered: '',
    certifications: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role,
          profile: {
            location: formData.location,
            contact: formData.contact,
            verificationStatus: formData.verificationStatus,
            farmSize: formData.farmSize,
            crops: formData.crops,
            experienceYears: parseInt(formData.experienceYears) || undefined,
            servicesOffered: formData.servicesOffered,
            certifications: formData.certifications,
          },
        }),
      });

      if (res.ok) {
        onSuccess();
        setFormData({
          name: '',
          email: '',
          password: '',
          location: '',
          contact: '',
          verificationStatus: false,
          farmSize: '',
          crops: '',
          experienceYears: '',
          servicesOffered: '',
          certifications: '',
        });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add user');
      }
    } catch (error) {
      setError('An error occurred while adding the user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-h-96 overflow-y-auto">
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="space-y-4 p-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter full name"
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email address"
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter password"
        />
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          type="text"
          value={formData.location}
          onChange={handleChange}
          placeholder="Enter location"
        />
      </div>

      <div>
        <Label htmlFor="contact">Contact</Label>
        <Input
          id="contact"
          name="contact"
          type="text"
          value={formData.contact}
          onChange={handleChange}
          placeholder="Enter contact number"
        />
      </div>

      <div>
        <Label htmlFor="verificationStatus">Verification Status</Label>
        <input
          id="verificationStatus"
          name="verificationStatus"
          type="checkbox"
          checked={formData.verificationStatus}
          onChange={(e) => setFormData(prev => ({ ...prev, verificationStatus: e.target.checked }))}
        />
      </div>

      <div>
        <Label htmlFor="farmSize">Farm Size</Label>
        <Input
          id="farmSize"
          name="farmSize"
          type="text"
          value={formData.farmSize}
          onChange={handleChange}
          placeholder="e.g., 5 acres"
        />
      </div>

      <div>
        <Label htmlFor="crops">Crops</Label>
        <Input
          id="crops"
          name="crops"
          type="text"
          value={formData.crops}
          onChange={handleChange}
          placeholder="e.g., Rice, Wheat"
        />
      </div>

      <div>
        <Label htmlFor="experienceYears">Experience Years</Label>
        <Input
          id="experienceYears"
          name="experienceYears"
          type="number"
          value={formData.experienceYears}
          onChange={handleChange}
          placeholder="Years of experience"
        />
      </div>

      <div>
        <Label htmlFor="servicesOffered">Services Offered</Label>
        <Input
          id="servicesOffered"
          name="servicesOffered"
          type="text"
          value={formData.servicesOffered}
          onChange={handleChange}
          placeholder="e.g., Tractor Rental, Harvesting"
        />
      </div>

      <div>
        <Label htmlFor="certifications">Certifications</Label>
        <Input
          id="certifications"
          name="certifications"
          type="text"
          value={formData.certifications}
          onChange={handleChange}
          placeholder="e.g., Organic Farming Certificate"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
          {loading ? 'Adding...' : 'Add User'}
        </Button>
      </div>
    </form>
    </div>
  );
}
