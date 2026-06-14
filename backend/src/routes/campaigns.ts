import { Router } from 'express';
import { Campaign } from '../models/Campaign';
import { Segment } from '../models/Segment';
import { Communication } from '../models/Communication';
import { generateStrategy } from '../services/strategyEngine';
import { generateCopy } from '../services/geminiCampaign';

const router = Router();

async function updateComm(id: any, status: string, revenue?: number) {
  const comm = await Communication.findById(id);
  if (!comm) return;

  comm.status = status;
  if (revenue) comm.revenue = revenue;
  
  comm.events.push({
    status,
    timestamp: new Date()
  });

  const updateField = `${status.toLowerCase()}At`;
  if (updateField in comm) {
    (comm as any)[updateField] = new Date();
  }

  await comm.save();

  if (status === 'Delivered') {
    await Campaign.findByIdAndUpdate(comm.campaignId, { status: 'Running' });
  }
}

router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    
    // Fetch stats for each campaign
    const campaignsWithStats = await Promise.all(campaigns.map(async (c: any) => {
      const stats = await Communication.aggregate([
        { $match: { campaignId: c._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      const statsObj = stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {} as Record<string, number>);
      
      const total = Object.values(statsObj).reduce((a: any, b: any) => a + b, 0) as number;
      
      const converted = (statsObj['Converted'] || 0) as number;
      const clicked = ((statsObj['Clicked'] || 0) as number) + converted;
      const opened = ((statsObj['Opened'] || 0) as number) + clicked;
      const delivered = ((statsObj['Delivered'] || 0) as number) + opened;

      return {
        ...c.toObject(),
        stats: {
          total,
          delivered,
          opened,
          clicked,
        },
        openRate: delivered ? Math.round(((opened as number) / (delivered as number)) * 100) : 0,
        ctr: opened ? Math.round(((clicked as number) / (opened as number)) * 100) : 0,
      };
    }));

    res.json(campaignsWithStats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/strategy', async (req, res) => {
  try {
    const { directive } = req.body;
    if (!directive) return res.status(400).json({ error: 'Directive is required' });
    
    const strategy = await generateStrategy(directive);
    res.json({ strategy });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/copy', async (req, res) => {
  try {
    const { strategy } = req.body;
    if (!strategy) return res.status(400).json({ error: 'Strategy is required' });
    
    const generatedMessage = await generateCopy(strategy);
    res.json({ generatedMessage });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/launch', async (req, res) => {
  try {
    const { name, directive, segmentId, channel, tone, generatedMessage, audienceCount, forecast } = req.body;

    // Create Campaign
    const campaign = new Campaign({
      name: name || 'AI Campaign',
      directive,
      segmentId,
      channel,
      tone,
      generatedMessage,
      audienceCount: audienceCount || 0,
      predictedOpenRate: forecast?.openRate,
      predictedCTR: forecast?.ctr,
      predictedConversions: forecast?.conversions,
      status: 'Pending' // Will update to Running when first callback arrives
    });
    
    await campaign.save();

    // Generate Initial Pending Communications
    const { Customer } = await import('../models/Customer');
    const mongoose = require('mongoose');
    let criteriaJson: any = {};
    if (segmentId && mongoose.Types.ObjectId.isValid(segmentId)) {
      const segment = await Segment.findById(segmentId).lean();
      if (segment && segment.criteriaJson) criteriaJson = segment.criteriaJson;
    } else if (directive && directive.toLowerCase().includes('dormancy')) {
      criteriaJson = { status: 'Inactive' };
    }
    const countToMock = audienceCount || 100;
    const customers = await Customer.find(criteriaJson).limit(countToMock).select('_id');
    
    const communications = [];
    
    for (const c of customers) {
      communications.push({
        campaignId: campaign._id,
        customerId: c._id,
        channel,
        status: 'Pending',
        retryCount: 0,
        events: []
      });
    }

    if (communications.length > 0) {
      const insertedComms = await Communication.insertMany(communications);

      // Async Dispatch to Channel Service
      // We do not await this loop to avoid blocking the CRM response
      setTimeout(async () => {
        // Dynamically import axios so we don't need it at the top level if not present
        const axios = require('axios');
        const channelServiceUrl = process.env.CHANNEL_SERVICE_URL || 'http://localhost:5001/send';
        for (const comm of insertedComms) {
          try {
            await axios.post(channelServiceUrl, {
              communicationId: comm._id,
              campaignId: campaign._id,
              customerId: comm.customerId,
              channel,
              message: generatedMessage
            });
          } catch (e: any) {
            const errorMsg = e.code === 'ECONNREFUSED' 
              ? 'Connection Refused (Is the Channel Service running on port 5001?)' 
              : (e.message || e.toString());
            console.error(`[CRM] Failed to dispatch to Channel Service for communication ${comm._id}: ${errorMsg}`);
          }
        }
      }, 0);
    }
    
    res.json({ message: 'Campaign dispatched to Channel Service', campaignId: campaign._id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
