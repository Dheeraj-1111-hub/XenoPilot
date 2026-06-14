import { Router } from 'express';
import { Customer } from '../models/Customer';
import { Campaign } from '../models/Campaign';
import { getAnalyticsOverview, getCampaignFunnel, getEventStream } from '../services/campaignMetrics';
import { generateInsight } from '../services/geminiAnalytics';

const router = Router();

// In-memory cache for insights
const insightCache = new Map<string, { insight: string, timestamp: number }>();

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
    
    // Generate AI Insight with caching to prevent 429 Quota Exceeded
    let insight = "Analyzing telemetry...";
    const now = Date.now();
    const cached = insightCache.get(campaignId);
    
    // Cache for 60 seconds (60000 ms)
    if (cached && now - cached.timestamp < 60000) {
      insight = cached.insight;
    } else {
      insight = await generateInsight(funnel, campaign);
      insightCache.set(campaignId, { insight, timestamp: now });
    }

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
