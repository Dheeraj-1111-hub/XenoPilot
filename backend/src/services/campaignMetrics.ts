import { Communication } from '../models/Communication';
import { Campaign } from '../models/Campaign';

export async function getCampaignFunnel(campaignId: string) {
  const comms = await Communication.find({ campaignId }).lean();
  
  let audience = comms.length;
  let sent = 0;
  let delivered = 0;
  let opened = 0;
  let clicked = 0;
  let converted = 0;
  let revenue = 0;

  for (const c of comms) {
    if (c.status === 'Sent' || c.status === 'Delivered' || c.status === 'Opened' || c.status === 'Clicked' || c.status === 'Converted') sent++;
    if (c.status === 'Delivered' || c.status === 'Opened' || c.status === 'Clicked' || c.status === 'Converted') delivered++;
    if (c.status === 'Opened' || c.status === 'Clicked' || c.status === 'Converted') opened++;
    if (c.status === 'Clicked' || c.status === 'Converted') clicked++;
    if (c.status === 'Converted') {
      converted++;
      revenue += c.revenue || 0;
    }
  }

  const deliveryRate = sent ? Math.round((delivered / sent) * 100) : 0;
  const openRate = delivered ? Math.round((opened / delivered) * 100) : 0;
  const ctr = opened ? Math.round((clicked / opened) * 100) : 0;
  const conversionRate = clicked ? Math.round((converted / clicked) * 100) : 0;

  return {
    audience,
    sent,
    delivered,
    opened,
    clicked,
    converted,
    revenue,
    deliveryRate,
    openRate,
    ctr,
    conversionRate
  };
}

export async function getEventStream(campaignId: string) {
  const comms = await Communication.find({ campaignId, events: { $exists: true, $not: { $size: 0 } } })
    .populate('customerId', 'name email')
    .limit(100).lean();

  const stream = [];
  for (const c of comms) {
    const customerName = (c.customerId as any)?.name || 'Customer';
    for (const e of c.events) {
      stream.push({
        customer: customerName,
        status: e.status,
        timestamp: e.timestamp,
        retryCount: c.retryCount
      });
    }
  }

  // Sort descending by timestamp and return top 15
  return stream.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 15);
}

export async function getAnalyticsOverview() {
  const campaigns = await Campaign.countDocuments();
  
  const [agg] = await Communication.aggregate([
    {
      $facet: {
        funnel: [
          {
            $group: {
              _id: null,
              audience: { $sum: 1 },
              sent: { $sum: { $cond: [{ $in: ['$status', ['Sent', 'Delivered', 'Opened', 'Clicked', 'Converted']] }, 1, 0] } },
              delivered: { $sum: { $cond: [{ $in: ['$status', ['Delivered', 'Opened', 'Clicked', 'Converted']] }, 1, 0] } },
              opened: { $sum: { $cond: [{ $in: ['$status', ['Opened', 'Clicked', 'Converted']] }, 1, 0] } },
              clicked: { $sum: { $cond: [{ $in: ['$status', ['Clicked', 'Converted']] }, 1, 0] } },
              converted: { $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] } },
              revenue: { $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, { $ifNull: ['$revenue', 0] }, 0] } },
              totalFailed: { $sum: { $cond: [{ $in: ['$status', ['Failed', 'Failed_Final']] }, 1, 0] } },
              totalCallbacks: { $sum: { $size: { $ifNull: ['$events', []] } } }
            }
          }
        ],
        channelStats: [
          {
            $group: {
              _id: { $ifNull: ['$channel', 'Email'] },
              sent: { $sum: { $cond: [{ $in: ['$status', ['Sent', 'Delivered', 'Opened', 'Clicked', 'Converted']] }, 1, 0] } },
              delivered: { $sum: { $cond: [{ $in: ['$status', ['Delivered', 'Opened', 'Clicked', 'Converted']] }, 1, 0] } },
              opened: { $sum: { $cond: [{ $in: ['$status', ['Opened', 'Clicked', 'Converted']] }, 1, 0] } },
              clicked: { $sum: { $cond: [{ $in: ['$status', ['Clicked', 'Converted']] }, 1, 0] } },
              converted: { $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] } }
            }
          }
        ],
        revenueByDay: [
          { $match: { status: 'Converted', revenue: { $gt: 0 } } },
          {
            $project: {
              revenue: 1,
              convertedDate: {
                $let: {
                  vars: {
                    convEvent: {
                      $arrayElemAt: [
                        { $filter: { input: { $ifNull: ['$events', []] }, as: 'e', cond: { $eq: ['$$e.status', 'Converted'] } } },
                        0
                      ]
                    }
                  },
                  in: { $ifNull: [{ $toDate: '$$convEvent.timestamp' }, { $toDate: '$convertedAt' }, new Date()] }
                }
              }
            }
          },
          {
            $group: {
              _id: { $dayOfWeek: '$convertedDate' },
              revenue: { $sum: '$revenue' }
            }
          }
        ]
      }
    }
  ]);

  const funnelRaw = agg.funnel[0] || {
    audience: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, revenue: 0, totalFailed: 0, totalCallbacks: 0
  };

  const deliveryRate = funnelRaw.sent ? Math.round((funnelRaw.delivered / funnelRaw.sent) * 100) : 0;
  const openRate = funnelRaw.delivered ? Math.round((funnelRaw.opened / funnelRaw.delivered) * 100) : 0;
  const ctr = funnelRaw.opened ? Math.round((funnelRaw.clicked / funnelRaw.opened) * 100) : 0;
  const conversionRate = funnelRaw.clicked ? Math.round((funnelRaw.converted / funnelRaw.clicked) * 100) : 0;
  const failureRate = funnelRaw.audience ? ((funnelRaw.totalFailed / funnelRaw.audience) * 100).toFixed(1) : "0.0";

  const channelPerformance = agg.channelStats.map((s: any) => ({
    name: s._id,
    volume: s.sent,
    openRate: s.delivered ? Math.round((s.opened / s.delivered) * 100) : 0,
    ctr: s.opened ? Math.round((s.clicked / s.opened) * 100) : 0,
    conversionRate: s.clicked ? Math.round((s.converted / s.clicked) * 100) : 0
  }));

  const dayMap: Record<number, string> = { 1: 'Sun', 2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat' };
  const revenueDataRaw: Record<string, number> = { 'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0 };
  
  agg.revenueByDay.forEach((r: any) => {
    const dayName = dayMap[r._id] || 'Sun';
    revenueDataRaw[dayName] += r.revenue;
  });

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const revenueData = days.map(day => ({ name: day, revenue: revenueDataRaw[day] }));

  let channelStatus = 'OFFLINE';
  try {
    const axios = require('axios');
    const healthUrl = process.env.CHANNEL_SERVICE_URL 
      ? process.env.CHANNEL_SERVICE_URL.replace('/send', '/health')
      : 'http://localhost:5001/health';
    const healthRes = await axios.get(healthUrl, { timeout: 1000 });
    if (healthRes.data?.status === 'ONLINE') channelStatus = 'ONLINE';
  } catch (e) {
    channelStatus = 'OFFLINE';
  }

  return {
    totalCampaigns: campaigns,
    totalCommunications: funnelRaw.audience,
    deliveryRate,
    openRate,
    ctr,
    conversions: funnelRaw.converted,
    revenue: funnelRaw.revenue,
    channelPerformance,
    revenueData,
    funnel: {
      audience: funnelRaw.audience,
      sent: funnelRaw.sent,
      delivered: funnelRaw.delivered,
      opened: funnelRaw.opened,
      clicked: funnelRaw.clicked,
      converted: funnelRaw.converted,
      revenue: funnelRaw.revenue
    },
    health: {
      totalCallbacks: funnelRaw.totalCallbacks,
      failureRate,
      channelStatus
    }
  };
}
