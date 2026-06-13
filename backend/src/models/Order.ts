import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  amount: number;
  category: string;
  orderDate: Date;
}

const OrderSchema = new Schema<IOrder>({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  orderDate: { type: Date, default: Date.now }
});

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
