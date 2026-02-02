import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'farmer' | 'provider' | 'user' | 'admin';
  profile?: {
    location?: string;
    contact?: string;
    verificationStatus?: boolean;
    farmSize?: string;
    crops?: string;
    experienceYears?: number;
    servicesOffered?: string;
    certifications?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'provider', 'user', 'admin'], required: true },
  profile: {
    location: String,
    contact: String,
    verificationStatus: { type: Boolean, default: false },
    farmSize: String,
    crops: String,
    experienceYears: Number,
    servicesOffered: String,
    certifications: String,
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
