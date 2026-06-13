import mongoose, { Schema, Document } from 'mongoose';

export interface IIntelligence extends Document {
  customerId: mongoose.Types.ObjectId;
  riskLevel: string;
  segment: string;
  recommendedChannel: string;
  recommendedAction: string;
  insight: string;
  generatedAt: Date;
}

const IntelligenceSchema = new Schema<IIntelligence>({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  riskLevel: { type: String, required: true },
  segment: { type: String, required: true },
  recommendedChannel: { type: String, required: true },
  recommendedAction: { type: String, required: true },
  insight: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now }
});

export const Intelligence = mongoose.model<IIntelligence>('Intelligence', IntelligenceSchema);
