'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Calendar, Clock, IndianRupee, CheckCircle, Download, QrCode, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Booking {
  _id: string;
  service: {
    name: string;
    category: string;
  };
  farmer: {
    name: string;
    email: string;
  };
  provider: {
    name: string;
    email: string;
  };
  status: string;
  workStartDate: string;
  notes?: string;
  createdAt: string;
  qrCode?: string;
}

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBooking(data);
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBooking();
  }, [id]);

  const downloadPDF = async () => {
    if (!booking) return;

    const element = document.getElementById('booking-details');
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`booking-${booking._id}.pdf`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Booking not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-4xl font-bold text-green-800">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600 mt-2">
            Your service has been successfully booked. Booking ID: {booking._id}
          </p>
        </motion.div>

        {/* Booking Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card id="booking-details" className="bg-white shadow-xl border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-600 to-yellow-500 text-white rounded-t-2xl">
              <CardTitle className="text-2xl">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Service Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-green-800 mb-4">Service Information</h3>

                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{booking.service.name}</p>
                      <p className="text-sm text-gray-600">{booking.service.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.workStartDate).toLocaleDateString()} at {new Date(booking.workStartDate).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Provider</p>
                      <p className="text-sm text-gray-600">{booking.provider.name}</p>
                      <p className="text-sm text-gray-600">{booking.provider.email}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-green-800 mb-4">Customer Information</h3>

                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{booking.farmer.name}</p>
                      <p className="text-sm text-gray-600">{booking.farmer.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <MapPin className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">Notes</p>
                        <p className="text-sm text-gray-600">{booking.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code */}
              {booking.qrCode && (
                <div className="mt-8 text-center">
                  <h3 className="text-xl font-semibold text-green-800 mb-4">Booking QR Code</h3>
                  <div className="inline-block p-4 bg-white border-2 border-green-200 rounded-lg">
                    <img src={booking.qrCode} alt="Booking QR Code" className="w-32 h-32" />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Show this QR code to the service provider</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-center gap-4"
        >
          <Button
            onClick={downloadPDF}
            className="bg-gradient-to-r from-green-600 to-yellow-500 hover:opacity-90 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
          >
            <Download className="h-5 w-5" />
            Download PDF
          </Button>

          <Button
            onClick={() => window.print()}
            variant="outline"
            className="px-6 py-3 rounded-lg font-bold border-green-300 text-green-700 hover:bg-green-50"
          >
            Print Ticket
          </Button>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">What is Next?</h3>
              <p className="text-gray-600">
                Your booking confirmation has been sent to your email. The service provider will contact you soon to confirm the details.
                You can track your booking status in your dashboard.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
