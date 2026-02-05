import mongoose, { Document, Schema } from 'mongoose';

export interface ILand extends Document {
  title: string;
  location: {
    state: string;
    district: string;
    village: string;
  };

  size: {
    value: number;
    unit: 'acre' | 'bigha';
  };
  soilType: string;
  waterAvailability: string;
  leasePrice: number;
  leaseDuration: string; // e.g., "1 year", "6 months"
  images: string[]; // Array of image URLs
  availabilityStatus: 'available' | 'leased' | 'unavailable';
  farmer: mongoose.Types.ObjectId; // Reference to User
  createdAt: Date;
  updatedAt: Date;
}

const LandSchema: Schema = new Schema({
  title: { type: String, required: true },
  location: {
    state: { type: String, required: true },
    district: { type: String, required: true },
    village: { type: String, required: true },
  },

  size: {
    value: { type: Number, required: true },
    unit: { type: String, enum: ['acre', 'bigha'], required: true },
  },
  soilType: { type: String, required: true },
  waterAvailability: { type: String, required: true },
  leasePrice: { type: Number, required: true },
  leaseDuration: { type: String, required: true },
  images: [{ type: String }],
  availabilityStatus: { type: String, enum: ['available', 'leased', 'unavailable'], default: 'available' },
  farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

LandSchema.index({ geometry: '2dsphere' });
LandSchema.index({ centroid: '2dsphere' });

export default mongoose.models.Land || mongoose.model<ILand>('Land', LandSchema);
