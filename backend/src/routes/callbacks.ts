import { Router } from 'express';
import { Communication } from '../models/Communication';
import { Campaign } from '../models/Campaign';

const router = Router();

router.post('/events', async (req, res) => {
  try {
    const { campaignId, customerId, event, timestamp, revenue, retryCount } = req.body;
    
    if (!campaignId || !customerId || !event) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const comm = await Communication.findOne({ campaignId, customerId });
    if (!comm) {
      return res.status(404).json({ error: 'Communication not found' });
    }

    // Update status
    comm.status = event;
    comm.retryCount = retryCount || 0;

    if (revenue) {
      comm.revenue = revenue;
    }

    // Append to events timeline
    comm.events.push({
      status: event,
      timestamp: new Date(timestamp || Date.now())
    });

    // Also update legacy timestamp fields for analytics engine compatibility
    const updateField = `${event.toLowerCase()}At`;
    if (updateField in comm) {
      (comm as any)[updateField] = new Date(timestamp || Date.now());
    }

    await comm.save();

    // If a communication is delivered, ensure the Campaign is marked Running
    if (event === 'Delivered') {
      await Campaign.findByIdAndUpdate(campaignId, { status: 'Running' });
    }

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/channel', async (req, res) => {
  try {
    const { communicationId, status } = req.body;
    
    if (!communicationId || !status) {
      return res.status(400).json({ error: 'Missing communicationId or status' });
    }

    const comm = await Communication.findById(communicationId);
    if (!comm) {
      return res.status(404).json({ error: 'Communication not found' });
    }

    // Map 'status' from channel service to proper case
    const statusMap: Record<string, string> = {
      'sent': 'Sent',
      'failed': 'Failed',
      'delivered': 'Delivered',
      'opened': 'Opened',
      'clicked': 'Clicked'
    };
    
    const mappedStatus = statusMap[status] || status;

    comm.status = mappedStatus;
    comm.events.push({
      status: mappedStatus,
      timestamp: new Date()
    });

    const updateField = `${mappedStatus.toLowerCase()}At`;
    if (updateField in comm) {
      (comm as any)[updateField] = new Date();
    }

    await comm.save();

    if (mappedStatus === 'Delivered') {
      await Campaign.findByIdAndUpdate(comm.campaignId, { status: 'Running' });
    }

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Channel Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
