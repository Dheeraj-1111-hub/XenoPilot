import mongoose from 'mongoose';
mongoose.connect('mongodb://127.0.0.1:27017/xenopilot').then(async () => {
  const frequent = await mongoose.connection.db!.collection('customers').countDocuments({ totalOrders: { $gt: 5 } });
  
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const inactive = await mongoose.connection.db!.collection('customers').countDocuments({ lastOrderDate: { $lt: sixtyDaysAgo } });
  
  // For top 10%, we can just check those spending over some threshold like 8000
  const vip = await mongoose.connection.db!.collection('customers').countDocuments({ totalSpent: { $gt: 11000 } });
  
  console.log({ frequent, inactive, vip });
  process.exit(0);
});
