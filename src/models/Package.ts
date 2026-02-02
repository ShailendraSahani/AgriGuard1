import mongoose, { Document, Schema } from 'mongoose';

export interface IPackage extends Document {
  name: string;
  crop: string;
  duration: string;
  price: number;
  features: string[];
  description: string;
  provider: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  crop: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  features: [{
    type: String,
    required: true,
  }],
  description: {
    type: String,
    required: true,
    trim: true,
  },
  provider: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Package || mongoose.model<IPackage>('Package', PackageSchema);
