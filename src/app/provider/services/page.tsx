'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AddServiceForm from '@/components/provider/AddServiceForm';
import Modal from '@/components/ui/modal';

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

export default function ProviderServices() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    } else {
      fetchServices();
    }
  }, [session, status, router]);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setServices(services.filter(service => service._id !== serviceId));
      } else {
        alert('Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('An error occurred while deleting the service');
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowAddServiceModal(true);
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage your farming services and offerings.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingService(null);
                setShowAddServiceModal(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add New Service
            </button>
          </div>
        </div>

        {/* Add/Edit Service Modal */}
        <Modal
          isOpen={showAddServiceModal}
          onClose={() => {
            setShowAddServiceModal(false);
            setEditingService(null);
          }}
          title={editingService ? "Edit Service" : "Add New Service"}
        >
          <AddServiceForm
            onSuccess={() => {
              setShowAddServiceModal(false);
              setEditingService(null);
              fetchServices();
            }}
            editingService={editingService}
          />
        </Modal>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.length > 0 ? (
            services.map((service) => (
              <div key={service._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.category}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      service.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : service.status === 'booked'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {service.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Price:</span> ₹{service.price}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Area:</span> {service.serviceArea}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Available:</span> {new Date(service.availabilityDates.start).toLocaleDateString()} - {new Date(service.availabilityDates.end).toLocaleDateString()}
                    </p>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {service.description}
                  </p>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditService(service)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteService(service._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No services</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first service.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddServiceModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Service
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
