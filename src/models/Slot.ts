import mongoose, { Document, Schema } from 'mongoose';

export interface ISlot extends Document {
  service: mongoose.Types.ObjectId;
  date: Date;
  time: string; // e.g., "09:00"
  status: 'available' | 'booked' | 'selected';
  price?: number; // optional override
  createdAt: Date;
  updatedAt: Date;
}

const SlotSchema: Schema = new Schema({
  service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['available', 'booked', 'selected'], default: 'available' },
  price: Number,
}, {
  timestamps: true,
});

// Compound index for unique slots per service, date, time
SlotSchema.index({ service: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.models.Slot || mongoose.model<ISlot>('Slot', SlotSchema);
