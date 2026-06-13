import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Segment } from '../models/Segment';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/xenopilot').then(async () => {
  await Segment.deleteMany({ name: { $in: ['VIP Customers', 'Inactive Cohort', 'Frequent Buyers'] } });
  
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  await Segment.insertMany([
    { 
      name: 'VIP Customers', 
      description: 'Top customers by lifetime value.', 
      criteriaJson: { totalSpent: { $gt: 11000 } },
      createdBy: 'AI'
    },
    { 
      name: 'Inactive Cohort', 
      description: 'Have not purchased in the last 60 days.', 
      criteriaJson: { lastOrderDate: { $lt: sixtyDaysAgo } },
      createdBy: 'AI'
    },
    { 
      name: 'Frequent Buyers', 
      description: 'More than 5 orders in the total history.', 
      criteriaJson: { totalOrders: { $gt: 5 } },
      createdBy: 'AI'
    }
  ]);
  console.log('Seed done');
  process.exit(0);
});
