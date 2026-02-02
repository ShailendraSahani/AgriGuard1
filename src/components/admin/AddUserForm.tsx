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
          ...formData,
          role,
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
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
          {loading ? 'Adding...' : 'Add User'}
        </Button>
      </div>
    </form>
  );
}
