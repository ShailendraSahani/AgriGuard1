'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddPackageFormProps {
  onSuccess: () => void;
}

export default function AddPackageForm({ onSuccess }: AddPackageFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    crop: '',
    duration: '',
    price: '',
    description: '',
    features: '',
    provider: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f);
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        features: featuresArray,
      };

      const res = await fetch('/api/admin/packages', {
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
          crop: '',
          duration: '',
          price: '',
          description: '',
          features: '',
          provider: '',
        });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add package');
      }
    } catch (error) {
      setError('An error occurred while adding the package');
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
        <Label htmlFor="name">Package Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter package name"
        />
      </div>

      <div>
        <Label htmlFor="crop">Crop Type</Label>
        <Input
          id="crop"
          name="crop"
          type="text"
          required
          value={formData.crop}
          onChange={handleChange}
          placeholder="e.g., Rice, Wheat, Cotton"
        />
      </div>

      <div>
        <Label htmlFor="duration">Duration</Label>
        <Input
          id="duration"
          name="duration"
          type="text"
          required
          value={formData.duration}
          onChange={handleChange}
          placeholder="e.g., 3 months, 6 months"
        />
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
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the package"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="features">Features (comma-separated)</Label>
        <Textarea
          id="features"
          name="features"
          required
          value={formData.features}
          onChange={handleChange}
          placeholder="e.g., Pest control, Fertilizer, Irrigation"
          rows={2}
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

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
          {loading ? 'Adding...' : 'Add Package'}
        </Button>
      </div>
    </form>
  );
}
