import { Router } from 'express';
import { Customer } from '../models/Customer';
import { Campaign } from '../models/Campaign';
import { getAnalyticsOverview, getCampaignFunnel, getEventStream } from '../services/campaignMetrics';
import { generateInsight } from '../services/geminiAnalytics';

const router = Router();

router.get('/dashboard', async (req, res) => {
  try {
    const customerCount = await Customer.countDocuments();
    const campaignCount = await Campaign.countDocuments();
    res.json({ customers: customerCount, campaigns: campaignCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/overview', async (req, res) => {
  try {
    const overview = await getAnalyticsOverview();
    res.json(overview);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/campaign/:id', async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const funnel = await getCampaignFunnel(campaignId);
    const eventStream = await getEventStream(campaignId);
    
    // Generate AI Insight
    const insight = await generateInsight(funnel, campaign);

    res.json({
      campaign,
      funnel,
      eventStream,
      insight
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
