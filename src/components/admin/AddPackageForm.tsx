"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IPackage } from "@/models/Package";

interface AddPackageFormProps {
  onSuccess: () => void;
  initialData?: Partial<IPackage>;
}

export default function AddPackageForm({
  onSuccess,
  initialData,
}: AddPackageFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    planType: initialData?.planType || "FREE",
    crop: initialData?.crop || "",
    durationDays: initialData?.durationDays || "",
    price: initialData?.price || "",
    discountPrice: initialData?.discountPrice || "",
    features: (initialData?.features || []).join(", "),
    benefits: (initialData?.benefits || []).join(", "),
    provider: initialData?.provider?._id?.toString() || "",
    isPopular: initialData?.isPopular || false,
    isActive: initialData?.isActive ?? true,
    maxBookings: initialData?.limits?.maxBookings || "",
    maxReports: initialData?.limits?.maxReports || "",
    maxLandArea: initialData?.limits?.maxLandArea || "",
    expertCalls: initialData?.limits?.expertCalls || "",
    diseaseDetection: initialData?.aiModules?.diseaseDetection || false,
    pestPrediction: initialData?.aiModules?.pestPrediction || false,
    yieldForecast: initialData?.aiModules?.yieldForecast || false,
    irrigationAI: initialData?.aiModules?.irrigationAI || false,
    sms: initialData?.notifications?.sms || false,
    whatsapp: initialData?.notifications?.whatsapp || false,
    email: initialData?.notifications?.email || false,
    satelliteMonitoring: initialData?.satelliteMonitoring || false,
    support: initialData?.support || "Community",
    marketplaceAccess: initialData?.marketplaceAccess || false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Input Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle Select Change
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        durationDays: Number(formData.durationDays),
        price: Number(formData.price),
        discountPrice: formData.discountPrice
          ? Number(formData.discountPrice)
          : undefined,
        features: formData.features.split(",").map((x) => x.trim()),
        benefits: formData.benefits.split(",").map((x) => x.trim()),
        limits: {
          maxBookings: formData.maxBookings ? Number(formData.maxBookings) : undefined,
          maxReports: formData.maxReports ? Number(formData.maxReports) : undefined,
          maxLandArea: formData.maxLandArea ? Number(formData.maxLandArea) : undefined,
          expertCalls: formData.expertCalls ? Number(formData.expertCalls) : undefined,
        },
        aiModules: {
          diseaseDetection: formData.diseaseDetection,
          pestPrediction: formData.pestPrediction,
          yieldForecast: formData.yieldForecast,
          irrigationAI: formData.irrigationAI,
        },
        notifications: {
          sms: formData.sms,
          whatsapp: formData.whatsapp,
          email: formData.email,
        },
        satelliteMonitoring: formData.satelliteMonitoring,
        support: formData.support,
        marketplaceAccess: formData.marketplaceAccess,
      };

      const res = await fetch(
        initialData
          ? `/api/admin/packages/${initialData._id}`
          : "/api/admin/packages",
        {
          method: initialData ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save package");

      onSuccess();
    } catch {
      setError("❌ Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-96 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto space-y-6 rounded-2xl border border-green-200 bg-white p-6 shadow-lg"
      >
      {/* Title */}
      <h2 className="text-xl font-bold text-green-700">
        🌱 Create Package Plan
      </h2>

      {/* Package Name */}
      <div>
        <Label>Package Name</Label>
        <Input
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Premium Crop Plan"
          className="mt-2 focus:ring-green-500"
        />
      </div>

      {/* Plan Type + Crop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Plan Type</Label>
          <Select
            defaultValue={formData.planType}
            onValueChange={(val) => handleSelectChange("planType", val)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FREE">FREE</SelectItem>
              <SelectItem value="PRO">PRO</SelectItem>
              <SelectItem value="PREMIUM">PREMIUM</SelectItem>
              <SelectItem value="ENTERPRISE">ENTERPRISE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Crop Type</Label>
          <Input
            name="crop"
            value={formData.crop}
            onChange={handleChange}
            placeholder="Rice / Wheat / Cotton"
            className="mt-2"
          />
        </div>
      </div>

      {/* Duration + Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Duration (Days)</Label>
          <Input
            name="durationDays"
            type="number"
            required
            value={formData.durationDays}
            onChange={handleChange}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Price ₹</Label>
          <Input
            name="price"
            type="number"
            required
            value={formData.price}
            onChange={handleChange}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Discount ₹</Label>
          <Input
            name="discountPrice"
            type="number"
            value={formData.discountPrice}
            onChange={handleChange}
            className="mt-2"
          />
        </div>
      </div>

      {/* Features */}
      <div>
        <Label>Features</Label>
        <Textarea
          name="features"
          value={formData.features}
          onChange={handleChange}
          placeholder="AI Monitoring, Pest Alerts..."
          className="mt-2"
        />
      </div>

      {/* Benefits */}
      <div>
        <Label>Benefits</Label>
        <Textarea
          name="benefits"
          value={formData.benefits}
          onChange={handleChange}
          placeholder="Higher Yield, Cost Saving..."
          className="mt-2"
        />
      </div>

      {/* Provider */}
      <div>
        <Label>Provider ID</Label>
        <Input
          name="provider"
          value={formData.provider}
          onChange={handleChange}
          placeholder="Provider User ID"
          className="mt-2"
        />
      </div>

      {/* Limits */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label>Max Bookings</Label>
          <Input
            name="maxBookings"
            type="number"
            value={formData.maxBookings}
            onChange={handleChange}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Max Reports</Label>
          <Input
            name="maxReports"
            type="number"
            value={formData.maxReports}
            onChange={handleChange}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Max Land Area</Label>
          <Input
            name="maxLandArea"
            type="number"
            value={formData.maxLandArea}
            onChange={handleChange}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Expert Calls</Label>
          <Input
            name="expertCalls"
            type="number"
            value={formData.expertCalls}
            onChange={handleChange}
            className="mt-2"
          />
        </div>
      </div>

      {/* AI Modules */}
      <div>
        <Label>AI Modules</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="diseaseDetection"
              checked={formData.diseaseDetection}
              onChange={handleChange}
              className="h-5 w-5 accent-green-500"
            />
            Disease Detection
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="pestPrediction"
              checked={formData.pestPrediction}
              onChange={handleChange}
              className="h-5 w-5 accent-green-500"
            />
            Pest Prediction
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="yieldForecast"
              checked={formData.yieldForecast}
              onChange={handleChange}
              className="h-5 w-5 accent-green-500"
            />
            Yield Forecast
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="irrigationAI"
              checked={formData.irrigationAI}
              onChange={handleChange}
              className="h-5 w-5 accent-green-500"
            />
            Irrigation AI
          </label>
        </div>
      </div>

      {/* Notifications */}
      <div>
        <Label>Notifications</Label>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="sms"
              checked={formData.sms}
              onChange={handleChange}
              className="h-5 w-5 accent-green-500"
            />
            SMS
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="whatsapp"
              checked={formData.whatsapp}
              onChange={handleChange}
              className="h-5 w-5 accent-green-500"
            />
            WhatsApp
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="email"
              checked={formData.email}
              onChange={handleChange}
              className="h-5 w-5 accent-green-500"
            />
            Email
          </label>
        </div>
      </div>

      {/* Support */}
      <div>
        <Label>Support</Label>
        <Select
          value={formData.support}
          onValueChange={(val) => handleSelectChange("support", val)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select support" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Community">Community</SelectItem>
            <SelectItem value="Chat">Chat</SelectItem>
            <SelectItem value="Call">Call</SelectItem>
            <SelectItem value="Dedicated Manager">Dedicated Manager</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Toggles */}
      <div className="flex items-center justify-between rounded-xl bg-green-50 p-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isPopular"
            checked={formData.isPopular}
            onChange={handleChange}
            className="h-5 w-5 accent-green-500"
          />
          ⭐ Popular Plan
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="satelliteMonitoring"
            checked={formData.satelliteMonitoring}
            onChange={handleChange}
            className="h-5 w-5 accent-green-500"
          />
          Satellite Monitoring
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="marketplaceAccess"
            checked={formData.marketplaceAccess}
            onChange={handleChange}
            className="h-5 w-5 accent-green-500"
          />
          Marketplace Access
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-5 w-5 accent-yellow-500"
          />
          Active
        </label>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-green-500 to-yellow-500 py-6 text-lg font-bold shadow-md hover:scale-[1.02] transition"
      >
        {loading ? "Saving..." : "Save Package 🚀"}
      </Button>
    </form>
    </div>
  );
}
