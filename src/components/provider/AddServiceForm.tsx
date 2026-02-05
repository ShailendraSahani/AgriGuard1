'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { toast } from "sonner"; // ✅ Toast Library

interface Service {
  _id: string;
  name: string;
  category: string;
  price: number;
  serviceArea: string;
  description: string;
  status: string;
  createdAt: string;
  availabilityDates: {
    start: Date;
    end: Date;
  };
}

interface AddServiceFormProps {
  onSuccess: () => void;
  editingService?: Service | null;
}

export default function AddServiceForm({ onSuccess, editingService }: AddServiceFormProps) {

  // ---------------- STATES ----------------
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    serviceArea: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const [loading, setLoading] = useState(false);

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name,
        category: editingService.category,
        price: editingService.price.toString(),
        serviceArea: editingService.serviceArea,
        description: editingService.description,
        startDate: new Date(editingService.availabilityDates.start).toISOString().split('T')[0],
        endDate: new Date(editingService.availabilityDates.end).toISOString().split('T')[0],
      });
    } else {
      setFormData({
        name: '',
        category: '',
        price: '',
        serviceArea: '',
        description: '',
        startDate: '',
        endDate: '',
      });
    }
  }, [editingService]);

  // ---------------- HANDLERS ----------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        serviceArea: formData.serviceArea,
        availabilityDates: {
          start: new Date(formData.startDate),
          end: new Date(formData.endDate),
        },
        description: formData.description,
      };

      const url = editingService ? `/api/services/${editingService._id}` : '/api/services';
      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingService ? "Service Updated Successfully 🎉" : "Service Added Successfully 🎉");
        onSuccess();
      } else {
        toast.error(editingService ? "Failed to update service ❌" : "Failed to add service ❌");
      }
    } catch {
      toast.error("Something went wrong!");
    }

    setLoading(false);
  };

  // ---------------- UI ----------------
  return (
    <div className="max-w-3xl mx-auto">

      {/* Card */}
      <Card className="rounded-3xl shadow-2xl border border-green-200 bg-white/80 backdrop-blur-xl">

        {/* Header */}
        <CardHeader className="rounded-t-3xl bg-gradient-to-r from-green-500 to-yellow-500 text-white">
          <CardTitle className="text-3xl font-extrabold">
            🌱 {editingService ? "Edit Service" : "Add New Service"}
          </CardTitle>
          <p className="text-white/90 text-sm">
            {editingService ? "Update your farming service details" : "Complete your farming service details"}
          </p>
        </CardHeader>

        <CardContent className="p-8 space-y-6">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-green-600">
                Basic Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Service Name</Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tractor Rental"
                    className="rounded-xl focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                    <SelectTrigger className="rounded-xl">
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
              </div>
            </div>

            {/* Pricing & Location */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-yellow-600">
                Pricing & Location
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Price (₹)</Label>
                  <Input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="500"
                    className="rounded-xl"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <Label>Service Area</Label>
                  <Input
                    name="serviceArea"
                    value={formData.serviceArea}
                    onChange={handleChange}
                    placeholder="Enter location"
                    className="rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Live Price Preview */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-green-100 to-yellow-100 shadow-md">
                <h4 className="font-bold text-green-700">
                  💰 Live Price Preview
                </h4>
                <p className="text-lg font-extrabold">
                  ₹ {formData.price || "0"} / Service
                </p>
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-green-600">
                Service Details
              </h3>

              <div>
                <Label>Description</Label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Write service details..."
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl px-8 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold shadow-xl hover:scale-105 transition"
              >
                {loading ? (editingService ? "Updating..." : "Publishing...") : (editingService ? "🚀 Update Service" : "🚀 Publish Service")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
