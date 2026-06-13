import { Router } from 'express';
import { Customer } from '../models/Customer';
import { Campaign } from '../models/Campaign';

const router = Router();

router.get('/overview', async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    
    // Calculate total revenue and avg spend using aggregation on Customer totalSpent
    const statsRes = await Customer.aggregate([
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: '$totalSpent' },
          avgSpend: { $avg: '$totalSpent' },
          totalOrders: { $sum: '$totalOrders' }
        } 
      }
    ]);

    const activeCustomers = await Customer.countDocuments({ status: 'Active' });
    const inactiveCustomers = await Customer.countDocuments({ status: 'Inactive' });
    const highValueDormant = await Customer.countDocuments({ status: 'Inactive', totalSpent: { $gt: 5000 } });

    // Calculate global open rate from Communication collection
    const { Communication } = require('../models/Communication');
    const commStats = await Communication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const commStatsObj = commStats.reduce((acc: any, curr: any) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    const totalComms = Object.values(commStatsObj).reduce((a: any, b: any) => a + b, 0) as number;
    const openedComms = ((commStatsObj['Opened'] || 0) as number) + ((commStatsObj['Clicked'] || 0) as number) + ((commStatsObj['Converted'] || 0) as number);
    const globalOpenRate = totalComms ? Math.round((openedComms / totalComms) * 100) : 0;

    const latestCampaign = await Campaign.findOne().sort({ createdAt: -1 }).lean();
    
    // Fetch a sample of inactive customers to prove anomaly is real
    const sampleInactive = await Customer.find({ status: 'Inactive' }).sort({ totalSpent: -1 }).limit(3).lean();

    if (statsRes.length > 0) {
      res.json({
        totalCustomers,
        totalRevenue: Math.round(statsRes[0].totalRevenue),
        avgSpend: Math.round(statsRes[0].avgSpend),
        totalOrders: statsRes[0].totalOrders,
        activeCustomers,
        inactiveCustomers,
        highValueDormant,
        globalOpenRate,
        latestCampaign,
        sampleInactive
      });
    } else {
      res.json({
        totalCustomers: 0,
        totalRevenue: 0,
        avgSpend: 0,
        totalOrders: 0,
        activeCustomers: 0,
        inactiveCustomers: 0,
        highValueDormant: 0,
        globalOpenRate: 0,
        latestCampaign: null,
        sampleInactive: []
      });
    }
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
