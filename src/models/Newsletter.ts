import mongoose, { Document, Schema } from 'mongoose';

export interface INewsletter extends Document {
  email: string;
  subscribedAt: Date;
}

const NewsletterSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Newsletter || mongoose.model<INewsletter>('Newsletter', NewsletterSchema);
