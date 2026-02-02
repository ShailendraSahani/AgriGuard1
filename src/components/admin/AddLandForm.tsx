'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddLandFormProps {
  onSuccess: () => void;
}

export default function AddLandForm({ onSuccess }: AddLandFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    state: '',
    district: '',
    village: '',
    value: '',
    unit: 'acre',
    soilType: '',
    waterAvailability: '',
    leasePrice: '',
    leaseDuration: '',
    farmer: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        location: {
          state: formData.state,
          district: formData.district,
          village: formData.village,
        },
        size: {
          value: parseFloat(formData.value),
          unit: formData.unit,
        },
        soilType: formData.soilType,
        waterAvailability: formData.waterAvailability,
        leasePrice: parseFloat(formData.leasePrice),
        leaseDuration: formData.leaseDuration,
        farmer: formData.farmer,
      };

      const res = await fetch('/api/admin/lands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
        setFormData({
          title: '',
          state: '',
          district: '',
          village: '',
          value: '',
          unit: 'acre',
          soilType: '',
          waterAvailability: '',
          leasePrice: '',
          leaseDuration: '',
          farmer: '',
        });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Land Title</Label>
        <Input
          id="title"
          name="title"
          type="text"
          required
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter land title"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            type="text"
            required
            value={formData.state}
            onChange={handleChange}
            placeholder="State"
          />
        </div>
        <div>
          <Label htmlFor="district">District</Label>
          <Input
            id="district"
            name="district"
            type="text"
            required
            value={formData.district}
            onChange={handleChange}
            placeholder="District"
          />
        </div>
        <div>
          <Label htmlFor="village">Village</Label>
          <Input
            id="village"
            name="village"
            type="text"
            required
            value={formData.village}
            onChange={handleChange}
            placeholder="Village"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="value">Size Value</Label>
          <Input
            id="value"
            name="value"
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.value}
            onChange={handleChange}
            placeholder="Size value"
          />
        </div>
        <div>
          <Label htmlFor="unit">Unit</Label>
          <Select onValueChange={(value) => handleSelectChange('unit', value)} defaultValue="acre">
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="acre">Acre</SelectItem>
              <SelectItem value="bigha">Bigha</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="soilType">Soil Type</Label>
        <Input
          id="soilType"
          name="soilType"
          type="text"
          required
          value={formData.soilType}
          onChange={handleChange}
          placeholder="e.g., Alluvial, Black, Red"
        />
      </div>

      <div>
        <Label htmlFor="waterAvailability">Water Availability</Label>
        <Input
          id="waterAvailability"
          name="waterAvailability"
          type="text"
          required
          value={formData.waterAvailability}
          onChange={handleChange}
          placeholder="e.g., Well, Canal, Rain-fed"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="leasePrice">Lease Price (₹)</Label>
          <Input
            id="leasePrice"
            name="leasePrice"
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.leasePrice}
            onChange={handleChange}
            placeholder="Lease price"
          />
        </div>
        <div>
          <Label htmlFor="leaseDuration">Lease Duration</Label>
          <Input
            id="leaseDuration"
            name="leaseDuration"
            type="text"
            required
            value={formData.leaseDuration}
            onChange={handleChange}
            placeholder="e.g., 1 year, 6 months"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="farmer">Farmer ID</Label>
        <Input
          id="farmer"
          name="farmer"
          type="text"
          required
          value={formData.farmer}
          onChange={handleChange}
          placeholder="Enter farmer user ID"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
          {loading ? 'Adding...' : 'Add Land'}
        </Button>
      </div>
    </form>
  );
}
