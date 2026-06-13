import { Router } from 'express';
import { Order } from '../models/Order';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 }).limit(100);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
