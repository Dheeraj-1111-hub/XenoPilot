import { Router } from 'express';
import { simulateLifecycle } from './services/eventSimulator';

const router = Router();

router.post('/send', (req, res) => {
  const { campaignId, customerId, channel, message } = req.body;

  if (!campaignId || !customerId || !channel) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Accept immediately
  res.status(202).json({ accepted: true });

  // Process asynchronously
  simulateLifecycle(campaignId, customerId, channel, message);
});

router.get('/health', (req, res) => {
  res.json({ status: 'ONLINE', service: 'Channel Provider API' });
});

export default router;
