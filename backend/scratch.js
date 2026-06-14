const mongoose = require('mongoose');
require('dotenv/config');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Customer = mongoose.model('Customer', new mongoose.Schema({}, {strict: false}));
  const count = await Customer.countDocuments();
  console.log('Total:', count);
  const vipCount = await Customer.countDocuments({ totalSpent: { $gt: 10000 } });
  console.log('VIP Total:', vipCount);
  const monthCount = await Customer.countDocuments({ lastOrderDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() } });
  console.log('Last month ISO String:', monthCount);
  const monthCountNative = await Customer.countDocuments({ lastOrderDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
  console.log('Last month Native Date:', monthCountNative);
  process.exit(0);
});
