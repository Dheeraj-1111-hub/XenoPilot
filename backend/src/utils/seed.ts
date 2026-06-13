import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { Customer } from '../models/Customer';
import { Order } from '../models/Order';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/xenopilot';

async function seed() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to DB');

    console.log('Clearing old data...');
    await Customer.deleteMany({});
    await Order.deleteMany({});

    const numCustomers = 10000;
    const numOrders = 50000;

    console.log(`Generating ${numCustomers} customers...`);
    const customersToInsert = [];
    for (let i = 0; i < numCustomers; i++) {
      customersToInsert.push({
        _id: new mongoose.Types.ObjectId(),
        name: faker.person.fullName(),
        email: faker.internet.email() + i, // ensure unique
        phone: faker.phone.number(),
        city: faker.location.city(),
        age: faker.number.int({ min: 18, max: 80 }),
        gender: faker.helpers.arrayElement(['Male', 'Female', 'Other']),
        totalSpent: 0,
        totalOrders: 0,
        status: faker.helpers.arrayElement(['Active', 'Inactive', 'At Risk'])
      });
    }

    await Customer.insertMany(customersToInsert, { ordered: false });
    console.log('✅ Customers inserted');

    console.log(`Generating ${numOrders} orders...`);
    const ordersToInsert = [];
    for (let i = 0; i < numOrders; i++) {
      const customer = faker.helpers.arrayElement(customersToInsert);
      const amount = faker.number.int({ min: 100, max: 15000 });
      ordersToInsert.push({
        customerId: customer._id,
        amount,
        category: faker.commerce.department(),
        orderDate: faker.date.recent({ days: 365 })
      });
    }

    // Insert orders in batches to avoid RAM issues
    const batchSize = 10000;
    for (let i = 0; i < ordersToInsert.length; i += batchSize) {
      const batch = ordersToInsert.slice(i, i + batchSize);
      await Order.insertMany(batch, { ordered: false });
      console.log(`Inserted ${i + batch.length} orders...`);
    }

    console.log('Updating customer totals...');
    // Aggregate orders and update customers
    const aggregated = await Order.aggregate([
      {
        $group: {
          _id: '$customerId',
          totalSpent: { $sum: '$amount' },
          totalOrders: { $sum: 1 },
          lastOrderDate: { $max: '$orderDate' }
        }
      }
    ]);

    const bulkOps = aggregated.map((agg: any) => ({
      updateOne: {
        filter: { _id: agg._id },
        update: {
          $set: {
            totalSpent: agg.totalSpent,
            totalOrders: agg.totalOrders,
            lastOrderDate: agg.lastOrderDate
          }
        }
      }
    }));

    // Perform bulk update
    for (let i = 0; i < bulkOps.length; i += 1000) {
      const batch = bulkOps.slice(i, i + 1000);
      await Customer.bulkWrite(batch);
    }
    console.log('✅ Customers totals updated');

    console.log('🎉 Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
