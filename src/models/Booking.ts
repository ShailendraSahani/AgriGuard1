import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  service: mongoose.Types.ObjectId;
  farmer: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  slot?: mongoose.Types.ObjectId;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  bookingDate: Date;
  workStartDate?: Date;
  workEndDate?: Date;
  totalAmount?: number;
  paymentMethod?: 'razorpay' | 'cashfree' | 'cod';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  qrCode?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema({
  service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  slot: { type: Schema.Types.ObjectId, ref: 'Slot' },
  status: { type: String, enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'], default: 'pending' },
  bookingDate: { type: Date, default: Date.now },
  workStartDate: Date,
  workEndDate: Date,
  totalAmount: Number,
  paymentMethod: { type: String, enum: ['razorpay', 'cashfree', 'cod'] },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  qrCode: String,
  notes: String,
}, {
  timestamps: true,
});

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
