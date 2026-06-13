import { Communication } from '../models/Communication';
import { Campaign } from '../models/Campaign';

export async function getCampaignFunnel(campaignId: string) {
  const comms = await Communication.find({ campaignId });
  
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
    .limit(100);

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
  const comms = await Communication.find();
  
  const funnel = {
    audience: comms.length,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    revenue: 0
  };

  const channelStats: any = {
    'Email': { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0 },
    'WhatsApp': { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0 },
    'SMS': { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0 },
    'RCS': { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0 }
  };

  let totalCallbacks = 0;
  let totalFailed = 0;

  for (const c of comms) {
    totalCallbacks += c.events ? c.events.length : 0;
    if (c.status === 'Failed_Final' || c.status === 'Failed') totalFailed++;

    const ch = c.channel || 'Email';
    if (!channelStats[ch]) channelStats[ch] = { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0 };
    
    if (c.status === 'Sent' || c.status === 'Delivered' || c.status === 'Opened' || c.status === 'Clicked' || c.status === 'Converted') {
      funnel.sent++; channelStats[ch].sent++;
    }
    if (c.status === 'Delivered' || c.status === 'Opened' || c.status === 'Clicked' || c.status === 'Converted') {
      funnel.delivered++; channelStats[ch].delivered++;
    }
    if (c.status === 'Opened' || c.status === 'Clicked' || c.status === 'Converted') {
      funnel.opened++; channelStats[ch].opened++;
    }
    if (c.status === 'Clicked' || c.status === 'Converted') {
      funnel.clicked++; channelStats[ch].clicked++;
    }
    if (c.status === 'Converted') {
      funnel.converted++; channelStats[ch].converted++;
      funnel.revenue += c.revenue || 0;
    }
  }

  const deliveryRate = funnel.sent ? Math.round((funnel.delivered / funnel.sent) * 100) : 0;
  const openRate = funnel.delivered ? Math.round((funnel.opened / funnel.delivered) * 100) : 0;
  const ctr = funnel.opened ? Math.round((funnel.clicked / funnel.opened) * 100) : 0;
  const conversionRate = funnel.clicked ? Math.round((funnel.converted / funnel.clicked) * 100) : 0;
  
  const failureRate = comms.length ? ((totalFailed / comms.length) * 100).toFixed(1) : "0.0";

  const channelPerformance = Object.keys(channelStats).map(name => {
    const s = channelStats[name];
    return {
      name,
      volume: s.sent,
      openRate: s.delivered ? Math.round((s.opened / s.delivered) * 100) : 0,
      ctr: s.opened ? Math.round((s.clicked / s.opened) * 100) : 0,
      conversionRate: s.clicked ? Math.round((s.converted / s.clicked) * 100) : 0
    };
  });

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

  // Generate chart data based on actual converted event timestamps
  const revenueDataRaw: Record<string, number> = { 'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0 };
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (const c of comms) {
    if (c.status === 'Converted' && c.revenue) {
      const convertedEvent = c.events?.find(e => e.status === 'Converted');
      if (convertedEvent && convertedEvent.timestamp) {
        const dayName = days[new Date(convertedEvent.timestamp).getDay()];
        revenueDataRaw[dayName] += c.revenue;
      } else if (c.convertedAt) {
        const dayName = days[new Date(c.convertedAt).getDay()];
        revenueDataRaw[dayName] += c.revenue;
      }
    }
  }

  const revenueData = days.map(day => ({ name: day, revenue: revenueDataRaw[day] }));

  return {
    totalCampaigns: campaigns,
    totalCommunications: comms.length,
    deliveryRate,
    openRate,
    ctr,
    conversions: funnel.converted,
    revenue: funnel.revenue,
    channelPerformance,
    revenueData,
    funnel,
    health: {
      totalCallbacks,
      failureRate,
      channelStatus
    }
  };
}
