import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone?: string;
  city: string;
  age?: number;
  gender?: string;
  totalSpent: number;
  totalOrders: number;
  lastOrderDate?: Date;
  status: string;
  createdAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  city: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  totalSpent: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  lastOrderDate: { type: Date },
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
