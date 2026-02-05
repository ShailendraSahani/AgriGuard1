import mongoose, { Document, Schema } from 'mongoose';

export interface IPackage extends Document {
  name: string;
  planType: 'FREE' | 'PRO' | 'PREMIUM' | 'ENTERPRISE';
  crop: string;
  durationDays: number;
  price: number;
  discountPrice?: number;
  isPopular: boolean;
  features: string[];
  limits?: {
    maxBookings?: number;
    maxReports?: number;
    maxLandArea?: number;
    expertCalls?: number;
  };
  aiModules?: {
    diseaseDetection?: boolean;
    pestPrediction?: boolean;
    yieldForecast?: boolean;
    irrigationAI?: boolean;
  };
  notifications?: {
    sms?: boolean;
    whatsapp?: boolean;
    email?: boolean;
  };
  satelliteMonitoring?: boolean;
  support?: 'Community' | 'Chat' | 'Call' | 'Dedicated Manager';
  marketplaceAccess?: boolean;
  benefits?: string[];
  provider?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  planType: {
    type: String,
    enum: ['FREE', 'PRO', 'PREMIUM', 'ENTERPRISE'],
    default: 'FREE',
  },
  crop: { type: String, required: true, trim: true },
  durationDays: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0 },
  isPopular: { type: Boolean, default: false },
  features: [{ type: String, required: true }],
  limits: {
    maxBookings: Number,
    maxReports: Number,
    maxLandArea: Number,
    expertCalls: Number,
  },
  aiModules: {
    diseaseDetection: Boolean,
    pestPrediction: Boolean,
    yieldForecast: Boolean,
    irrigationAI: Boolean,
  },
  notifications: {
    sms: Boolean,
    whatsapp: Boolean,
    email: Boolean,
  },
  satelliteMonitoring: { type: Boolean, default: false },
  support: {
    type: String,
    enum: ['Community', 'Chat', 'Call', 'Dedicated Manager'],
    default: 'Community',
  },
  marketplaceAccess: { type: Boolean, default: false },
  benefits: [{ type: String }],
  provider: { type: Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Package || mongoose.model<IPackage>('Package', PackageSchema);
