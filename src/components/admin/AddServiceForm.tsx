'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddServiceFormProps {
  onSuccess: () => void;
}

export default function AddServiceForm({ onSuccess }: AddServiceFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    serviceArea: '',
    description: '',
    provider: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        availabilityDates: {
          start: new Date(formData.startDate),
          end: new Date(formData.endDate),
        },
      };

      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
        setFormData({
          name: '',
          category: '',
          price: '',
          serviceArea: '',
          description: '',
          provider: '',
          startDate: '',
          endDate: '',
        });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add service');
      }
    } catch (error) {
      setError('An error occurred while adding the service');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        <Label htmlFor="name">Service Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter service name"
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)} required>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tractor Rental">Tractor Rental</SelectItem>
            <SelectItem value="Harvesting">Harvesting</SelectItem>
            <SelectItem value="Irrigation Setup">Irrigation Setup</SelectItem>
            <SelectItem value="Seed Supply">Seed Supply</SelectItem>
            <SelectItem value="Soil Testing">Soil Testing</SelectItem>
            <SelectItem value="Drone Spray">Drone Spray</SelectItem>
            <SelectItem value="Labor Supply">Labor Supply</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="price">Price (₹)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          required
          min="0"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          placeholder="Enter price"
        />
      </div>

      <div>
        <Label htmlFor="serviceArea">Service Area</Label>
        <Input
          id="serviceArea"
          name="serviceArea"
          type="text"
          required
          value={formData.serviceArea}
          onChange={handleChange}
          placeholder="Enter service area"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the service"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="provider">Provider ID</Label>
        <Input
          id="provider"
          name="provider"
          type="text"
          required
          value={formData.provider}
          onChange={handleChange}
          placeholder="Enter provider user ID"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            required
            value={formData.startDate}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            required
            value={formData.endDate}
            onChange={handleChange}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
          {loading ? 'Adding...' : 'Add Service'}
        </Button>
      </div>
    </form>
  );
}
