import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  name: string;
  category: 'Tractor Rental' | 'Harvesting' | 'Irrigation Setup' | 'Seed Supply' | 'Soil Testing' | 'Drone Spray' | 'Labor Supply';
  price: number;
  serviceArea: string;
  availabilityDates: {
    start: Date;
    end: Date;
  };
  description: string;
  provider: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema = new Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Tractor Rental', 'Harvesting', 'Irrigation Setup', 'Seed Supply', 'Soil Testing', 'Drone Spray', 'Labor Supply'], required: true },
  price: { type: Number, required: true },
  serviceArea: { type: String, required: true },
  availabilityDates: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  description: { type: String, required: true },
  provider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

export default mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
