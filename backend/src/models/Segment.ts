import mongoose, { Schema, Document } from 'mongoose';

export interface ISegment extends Document {
  name: string;
  description: string;
  criteriaJson: any;
  createdBy?: string;
  createdAt: Date;
}

const SegmentSchema = new Schema<ISegment>({
  name: { type: String, required: true },
  description: { type: String },
  criteriaJson: { type: Schema.Types.Mixed },
  createdBy: { type: String, default: 'AI' },
  createdAt: { type: Date, default: Date.now }
});

export const Segment = mongoose.model<ISegment>('Segment', SegmentSchema);
