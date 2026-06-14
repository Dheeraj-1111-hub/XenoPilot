import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunicationEvent {
  status: string;
  timestamp: Date;
}

export interface ICommunication extends Document {
  campaignId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  channel: string;
  status: string;
  revenue?: number;
  retryCount: number;
  events: ICommunicationEvent[];
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  convertedAt?: Date;
}

const CommunicationEventSchema = new Schema<ICommunicationEvent>({
  status: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now }
}, { _id: false });

const CommunicationSchema = new Schema<ICommunication>({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  channel: { type: String, required: true, default: 'Email' },
  status: { type: String, default: 'Pending' },
  revenue: { type: Number },
  retryCount: { type: Number, default: 0 },
  events: [CommunicationEventSchema],
  sentAt: { type: Date },
  deliveredAt: { type: Date },
  openedAt: { type: Date },
  clickedAt: { type: Date },
  convertedAt: { type: Date }
});

CommunicationSchema.index({ campaignId: 1, customerId: 1 });

export const Communication = mongoose.model<ICommunication>('Communication', CommunicationSchema);
