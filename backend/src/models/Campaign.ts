import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  directive: string;
  segmentId: string;
  channel: string;
  tone: string;
  generatedMessage: string;
  audienceCount: number;
  status: string;
  predictedOpenRate?: number;
  predictedCTR?: number;
  predictedConversions?: number;
  createdAt: Date;
}

const CampaignSchema = new Schema<ICampaign>({
  name: { type: String, required: true },
  directive: { type: String, required: true },
  segmentId: { type: String, ref: 'Segment', required: true },
  channel: { type: String, required: true },
  tone: { type: String, required: true },
  generatedMessage: { type: String, required: true },
  audienceCount: { type: Number, default: 0 },
  status: { type: String, default: 'Draft' },
  predictedOpenRate: { type: Number },
  predictedCTR: { type: Number },
  predictedConversions: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);
