import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  service: mongoose.Types.ObjectId;
  farmer: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  status: 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Rejected';
  bookingDate: Date;
  workStartDate?: Date;
  workEndDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema({
  service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Rejected'], default: 'Pending' },
  bookingDate: { type: Date, default: Date.now },
  workStartDate: Date,
  workEndDate: Date,
  notes: String,
}, {
  timestamps: true,
});

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
