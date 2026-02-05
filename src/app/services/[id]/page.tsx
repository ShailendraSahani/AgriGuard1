'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Calendar, Clock, IndianRupee, CheckCircle, XCircle, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSocket } from '@/contexts/SocketContext';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  provider: {
    name: string;
  };
  availabilityDates: {
    start: Date;
    end: Date;
  };
}

interface Slot {
  _id: string;
  date: string;
  time: string;
  status: 'available' | 'booked' | 'selected';
  price?: number;
}

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const WINDOW_DAYS = 7;

const toDateKey = (date: Date) => date.toISOString().split('T')[0];

export default function ServiceBookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { socket } = useSocket();

  const [service, setService] = useState<Service | null>(null);
  const [slotMap, setSlotMap] = useState<Record<string, Slot[]>>({});
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [visibleDates, setVisibleDates] = useState<string[]>([]);
  const [viewStartDate, setViewStartDate] = useState<Date | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cashfree' | 'cod'>('cod');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [paymentHint, setPaymentHint] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`/api/services/${id}`);
        if (res.ok) {
          const data = await res.json();
          setService(data);
        }
      } catch (error) {
        console.error('Error fetching service:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchService();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const handleSlotUpdate = (updatedSlot: Slot) => {
      const dateKey = new Date(updatedSlot.date).toISOString().split('T')[0];
      setSlotMap((prev) => {
        const slotsForDate = prev[dateKey] || [];
        const updatedSlots = slotsForDate.map((slot) =>
          slot._id === updatedSlot._id ? updatedSlot : slot
        );
        return { ...prev, [dateKey]: updatedSlots };
      });
    };

    socket.on('slot-updated', handleSlotUpdate);

    return () => {
      socket.off('slot-updated', handleSlotUpdate);
    };
  }, [socket]);

  const availability = useMemo(() => {
    if (!service) return null;
    return {
      start: new Date(service.availabilityDates.start),
      end: new Date(service.availabilityDates.end),
    };
  }, [service]);

  useEffect(() => {
    if (!availability) return;
    if (viewStartDate) return;

    const today = new Date();
    const start = availability.start > today ? availability.start : today;
    setViewStartDate(start);
  }, [availability, viewStartDate]);

  const fetchSlotsForDates = async (dates: string[]) => {
    const requests = dates.map(async (date) => {
      const res = await fetch(`/api/services/${id}/slots?date=${date}`);
      if (!res.ok) return { date, slots: [] as Slot[] };
      const slots = await res.json();
      return { date, slots: Array.isArray(slots) ? slots : [] };
    });

    const results = await Promise.all(requests);
    const map: Record<string, Slot[]> = {};
    results.forEach((result) => {
      map[result.date] = result.slots;
    });
    setSlotMap(map);
  };

  useEffect(() => {
    if (!availability || !viewStartDate || !service) return;

    const dates: string[] = [];
    const endWindow = new Date(viewStartDate);
    endWindow.setDate(endWindow.getDate() + (WINDOW_DAYS - 1));

    for (let d = new Date(viewStartDate); d <= endWindow; d.setDate(d.getDate() + 1)) {
      if (d < availability.start || d > availability.end) continue;
      dates.push(toDateKey(new Date(d)));
    }

    setVisibleDates(dates);
    fetchSlotsForDates(dates);
  }, [availability, viewStartDate, service]);

  const goToPrevWindow = () => {
    if (!availability || !viewStartDate) return;
    const prev = new Date(viewStartDate);
    prev.setDate(prev.getDate() - WINDOW_DAYS);
    setViewStartDate(prev < availability.start ? availability.start : prev);
  };

  const goToNextWindow = () => {
    if (!availability || !viewStartDate) return;
    const next = new Date(viewStartDate);
    next.setDate(next.getDate() + WINDOW_DAYS);
    if (next > availability.end) return;
    setViewStartDate(next);
  };

  const handleSlotSelect = (slot: Slot) => {
    if (slot.status === 'available') {
      setSelectedSlot(slot);
      setSelectedSlotId(slot._id);
      setSlotMap((prev) => {
        const next: Record<string, Slot[]> = {};
        Object.entries(prev).forEach(([date, slots]) => {
          next[date] = slots.map((s) => {
            if (s._id === slot._id) return { ...s, status: 'selected' };
            if (s._id === selectedSlotId) return { ...s, status: 'available' };
            return s;
          });
        });
        return next;
      });
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot || !session) {
      alert('Please select a slot and ensure you are logged in.');
      return;
    }

    setBookingLoading(true);
    setPaymentHint(null);
    try {
      const bookingData = {
        serviceId: id,
        slotId: selectedSlot._id,
        paymentMethod,
      };

      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (res.ok) {
        const { booking, paymentData } = await res.json();

        if (paymentMethod === 'razorpay' && paymentData?.id && service) {
          const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
          if (scriptLoaded && (window as any).Razorpay) {
            const options = {
              key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
              amount: paymentData.amount,
              currency: paymentData.currency,
              name: 'AgriGuard',
              description: service.name,
              order_id: paymentData.id,
              handler: () => {
                setBookingSuccess(true);
                setTimeout(() => {
                  router.push(`/bookings/${booking._id}`);
                }, 1500);
              },
            };
            new (window as any).Razorpay(options).open();
            return;
          }
        }

        if (paymentMethod === 'cashfree') {
          const paymentLink =
            paymentData?.data?.payment_link ||
            paymentData?.data?.paymentLink ||
            paymentData?.payment_link ||
            paymentData?.paymentLink;
          if (paymentLink) {
            setPaymentHint('Redirecting to Cashfree payment...');
            window.location.href = paymentLink;
            return;
          }
        }

        setBookingSuccess(true);
        setTimeout(() => {
          router.push(`/bookings/${booking._id}`);
        }, 2000);
      } else {
        const errorData = await res.json();
        alert(`Booking failed: ${errorData.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const loadScript = (src: string) =>
    new Promise<boolean>((resolve) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Service not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white shadow-xl border-green-200">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-green-800">
                {service.name}
              </CardTitle>
              <p className="text-gray-600">{service.description}</p>
              <div className="flex items-center gap-4 mt-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {service.category}
                </span>
                <div className="flex items-center text-2xl font-bold text-green-700">
                  <IndianRupee className="h-6 w-6" />
                  {service.price}
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white shadow-xl border-green-200">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Multi-Day Slot Map
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Pick a slot like a ticket booking grid. Blue is selected, green is available, gray is booked.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={goToPrevWindow} className="rounded-full">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={goToNextWindow} className="rounded-full">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {visibleDates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="mx-auto h-12 w-12 mb-4" />
                  <p>No available dates in this window</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[720px]">
                    <div className="grid grid-cols-[120px_repeat(7,minmax(90px,1fr))] gap-2">
                      <div className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Time
                      </div>
                      {visibleDates.map((date) => (
                        <div key={date} className="text-center text-sm font-semibold text-green-800">
                          <div>{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                          <div className="text-lg">{new Date(date).getDate()}</div>
                        </div>
                      ))}

                      {TIME_SLOTS.map((time) => (
                        <div key={`row-${time}`} className="contents">
                          <div className="text-sm font-medium text-gray-600">
                            {time}
                          </div>
                          {visibleDates.map((date) => {
                            const slot = (slotMap[date] || []).find((s) => s.time === time);
                            const status = slot?.status || 'available';
                            const isBooked = status === 'booked';
                            const isSelected = status === 'selected';
                            const isAvailable = status === 'available';

                            return (
                              <button
                                key={`${date}-${time}`}
                                onClick={() => slot && handleSlotSelect(slot)}
                                disabled={!slot || isBooked}
                                title={
                                  slot
                                    ? `${new Date(slot.date).toLocaleDateString()} ${slot.time} • ₹${slot.price || service.price} • ${slot.status}`
                                    : 'Slot not available'
                                }
                                className={`h-12 rounded-lg border-2 text-xs font-semibold transition-all ${
                                  isBooked
                                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : isAvailable
                                    ? 'bg-green-50 border-green-300 text-green-700 hover:border-green-500'
                                    : 'border-gray-200'
                                }`}
                              >
                                {slot ? '₹' + (slot.price || service.price) : '--'}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-start gap-3 text-sm text-gray-600">
                <Info className="h-4 w-4 mt-0.5 text-green-600" />
                <p>
                  Tip: Hover any slot to see price and details. Booked slots are disabled and auto-blocked in real time.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {selectedSlot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Card className="bg-white shadow-xl border-green-200">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium">Razorpay</div>
                    <div className="text-sm text-gray-600">Online Payment</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cashfree')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'cashfree'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="font-medium">Cashfree</div>
                    <div className="text-sm text-gray-600">Online Payment</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-yellow-300'
                    }`}
                  >
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay after service</div>
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                  <div className="text-lg font-bold">
                    Total: ₹{selectedSlot.price || service.price}
                  </div>
                  <Button
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    className="bg-gradient-to-r from-green-600 to-yellow-500 hover:opacity-90 text-white px-8 py-3 rounded-lg font-bold"
                  >
                    {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                  </Button>
                </div>
                {paymentHint && (
                  <p className="mt-4 text-sm text-green-700">{paymentHint}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {bookingSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <Card className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
              <div className="text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-green-800 mb-2">Booking Confirmed!</h3>
                <p className="text-gray-600">Redirecting to booking details...</p>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
