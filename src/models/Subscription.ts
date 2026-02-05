import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  package: mongoose.Types.ObjectId;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod?: 'razorpay' | 'cashfree' | 'cod';
  amountPaid?: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  renewalCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: Schema.Types.ObjectId, ref: 'Package', required: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'cancelled'],
      default: 'pending',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    autoRenew: { type: Boolean, default: false },
    paymentMethod: { type: String, enum: ['razorpay', 'cashfree', 'cod'] },
    amountPaid: Number,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    renewalCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ user: 1, status: 1 });
SubscriptionSchema.index({ endDate: 1 });

export default mongoose.models.Subscription ||
  mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
