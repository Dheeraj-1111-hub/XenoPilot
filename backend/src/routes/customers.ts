import { Router } from 'express';
import { Customer } from '../models/Customer';
import { Order } from '../models/Order';
import { Communication } from '../models/Communication';
import { Intelligence } from '../models/Intelligence';
import { generateCustomerInsight } from '../ai/gemini';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Pagination could be added here, currently limits to 100
    const customers = await Customer.find().sort({ createdAt: -1 }).limit(100);
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).lean();
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    // Fetch related data concurrently
    const [orders, communications, intelligence] = await Promise.all([
      Order.find({ customerId: req.params.id }).sort({ orderDate: -1 }).limit(10).lean(),
      Communication.find({ customerId: req.params.id })
        .populate('campaignId', 'name channel goal')
        .sort({ sentAt: -1 })
        .limit(10)
        .lean(),
      Intelligence.findOne({ customerId: req.params.id }).lean()
    ]);

    res.json({
      ...customer,
      orders,
      communications,
      intelligence
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
