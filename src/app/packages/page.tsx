"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PackageCard } from "@/components/PackageCard";
import { useSocket } from "@/contexts/SocketContext";

interface Package {
  _id: string;
  name: string;
  planType: string;
  crop: string;
  durationDays: number;
  price: number;
  discountPrice?: number;
  isPopular?: boolean;
  features: string[];
  benefits?: string[];
  provider?: {
    name: string;
    email: string;
  };
  isActive: boolean;
}

export default function PackagesPage() {
  const { data: session, status } = useSession();
  const { socket } = useSocket();

  const [packages, setPackages] = useState<Package[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  const [selectedCrop, setSelectedCrop] = useState("");
  const [searchProvider, setSearchProvider] = useState("");

  const crops = [
    "Rice",
    "Wheat",
    "Corn",
    "Soybean",
    "Cotton",
    "Sugarcane",
    "Potato",
    "Tomato",
    "Onion",
    "Vegetables",
  ];

  const fetchPackages = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCrop) params.append("crop", selectedCrop);
      if (searchProvider) params.append("provider", searchProvider);

      const response = await fetch(`/api/packages?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages || []);
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch("/api/subscriptions");
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    fetchPackages();
    if (session) fetchSubscriptions();
  }, [session, status]);

  useEffect(() => {
    fetchPackages();
  }, [selectedCrop, searchProvider]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => {
      fetchPackages();
      fetchSubscriptions();
    };
    socket.on("packages-updated", refresh);
    socket.on("subscription-updated", refresh);
    return () => {
      socket.off("packages-updated", refresh);
      socket.off("subscription-updated", refresh);
    };
  }, [socket]);

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      const existing = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );
      if (existing) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleSubscribe = async (pkg: Package) => {
    if (!session) {
      alert("Please sign in to subscribe.");
      return;
    }
    setPaymentLoading(pkg._id);
    try {
      const res = await fetch("/api/packages/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg._id,
          paymentMethod: "razorpay",
          autoRenew: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      if (data.paymentData?.id) {
        const ok = await loadRazorpay();
        if (!ok || !(window as any).Razorpay) {
          throw new Error("Payment SDK failed to load");
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.paymentData.amount,
          currency: data.paymentData.currency,
          name: "AgriGuard",
          description: `${pkg.name} subscription`,
          order_id: data.paymentData.id,
          handler: async (response: any) => {
            await fetch("/api/subscriptions/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subscriptionId: data.subscriptionId,
                razorpayPaymentId: response.razorpay_payment_id,
              }),
            });
            fetchSubscriptions();
          },
          theme: { color: "#22c55e" },
        };
        new (window as any).Razorpay(options).open();
      }
    } catch (error: any) {
      alert(error.message || "Subscription failed");
    } finally {
      setPaymentLoading(null);
    }
  };

  const handleRenew = async (subId: string, pkgName: string) => {
    setPaymentLoading(subId);
    try {
      const res = await fetch(`/api/subscriptions/${subId}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "razorpay" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to renew");

      if (data.paymentData?.id) {
        const ok = await loadRazorpay();
        if (!ok || !(window as any).Razorpay) {
          throw new Error("Payment SDK failed to load");
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.paymentData.amount,
          currency: data.paymentData.currency,
          name: "AgriGuard",
          description: `${pkgName} renewal`,
          order_id: data.paymentData.id,
          handler: async (response: any) => {
            await fetch("/api/subscriptions/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subscriptionId: data.subscriptionId,
                razorpayPaymentId: response.razorpay_payment_id,
              }),
            });
            fetchSubscriptions();
          },
          theme: { color: "#eab308" },
        };
        new (window as any).Razorpay(options).open();
      }
    } catch (error: any) {
      alert(error.message || "Renewal failed");
    } finally {
      setPaymentLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold text-green-600">
        Loading Packages...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="max-w-7xl mx-auto py-10 px-6">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-green-700">
            🌱 Farming Packages
          </h1>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            Subscribe to powerful AI plans with renewals and instant activation.
          </p>
        </div>

        <div className="mb-10 bg-white border border-green-200 rounded-3xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-green-700 mb-4">
            🔍 Filter Packages
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="crop-select" className="block text-sm font-medium text-gray-700">
                Crop Type
              </label>
              <select
                id="crop-select"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="mt-2 w-full rounded-xl border border-green-300 px-4 py-3 shadow-sm focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Crops</option>
                {crops.map((crop) => (
                  <option key={crop}>{crop}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Provider Name
              </label>
              <input
                value={searchProvider}
                onChange={(e) => setSearchProvider(e.target.value)}
                placeholder="Enter provider name..."
                className="mt-2 w-full rounded-xl border border-green-300 px-4 py-3 shadow-sm focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg._id}
              name={pkg.name}
              planType={pkg.planType}
              crop={pkg.crop}
              durationDays={pkg.durationDays}
              price={pkg.price}
              discountPrice={pkg.discountPrice}
              isPopular={pkg.isPopular}
              features={pkg.features}
              benefits={pkg.benefits}
              onSubscribe={() => handleSubscribe(pkg)}
            />
          ))}
        </div>

        {session && subscriptions.length > 0 && (
          <div className="mt-12 bg-white border border-green-200 rounded-3xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-green-700 mb-4">
              My Subscriptions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map((sub) => (
                <div key={sub._id} className="border rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{sub.package?.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(sub.startDate).toLocaleDateString()} -{" "}
                        {new Date(sub.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        sub.status === "active"
                          ? "bg-green-100 text-green-700"
                          : sub.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleRenew(sub._id, sub.package?.name || "Package")}
                      className="px-4 py-2 rounded-full text-white bg-gradient-to-r from-green-500 to-yellow-500 hover:opacity-90 text-sm"
                    >
                      {paymentLoading === sub._id ? "Processing..." : "Renew"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {packages.length === 0 && (
          <p className="text-center mt-12 text-gray-500 font-medium">
            No packages found 🚫
          </p>
        )}
      </div>
    </div>
  );
}
