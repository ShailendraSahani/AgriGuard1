import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaseRequest extends Document {
  land: mongoose.Types.ObjectId; // Reference to Land
  requester: mongoose.Types.ObjectId; // Reference to User (the one requesting the lease)
  status: 'pending' | 'accepted' | 'rejected';
  agreement?: string; // Optional agreement text or file URL
  requestedAt: Date;
  respondedAt?: Date;
}

const LeaseRequestSchema: Schema = new Schema({
  land: { type: Schema.Types.ObjectId, ref: 'Land', required: true },
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  agreement: { type: String },
  requestedAt: { type: Date, default: Date.now },
  respondedAt: { type: Date },
}, {
  timestamps: true,
});

export default mongoose.models.LeaseRequest || mongoose.model<ILeaseRequest>('LeaseRequest', LeaseRequestSchema);
