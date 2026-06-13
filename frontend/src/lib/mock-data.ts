export const kpis = {
  totalCustomers: 12583,
  activeCampaigns: 8,
  revenueInfluenced: "₹4.8L",
  engagementRate: "63%",
};

export const funnel = [
  { stage: "Sent", value: 24000 },
  { stage: "Delivered", value: 22850 },
  { stage: "Opened", value: 16420 },
  { stage: "Clicked", value: 6840 },
  { stage: "Converted", value: 1280 },
];

export const recentAI = [
  { type: "Segment", text: "Created segment: Inactive High-Value Customers", time: "2m ago" },
  { type: "Suggestion", text: "Suggested WhatsApp Campaign for VIP cohort", time: "14m ago" },
  { type: "Prediction", text: "Predicted 71% Open Rate for Diwali Reactivation", time: "1h ago" },
  { type: "Insight", text: "Detected churn risk in 312 Frequent Buyers", time: "3h ago" },
];

export type Customer = {
  id: string;
  name: string;
  email: string;
  orders: number;
  spend: number;
  lastOrder: string;
  segment: string;
  city: string;
  status: "Active" | "Inactive" | "At Risk";
};

export const customers: Customer[] = [
  { id: "c1", name: "Aarav Sharma", email: "aarav@example.com", orders: 18, spend: 42500, lastOrder: "2 days ago", segment: "VIP", city: "Mumbai", status: "Active" },
  { id: "c2", name: "Sai Krishnan", email: "sai@example.com", orders: 6, spend: 9800, lastOrder: "72 days ago", segment: "Inactive", city: "Bengaluru", status: "Inactive" },
  { id: "c3", name: "Meera Iyer", email: "meera@example.com", orders: 24, spend: 61200, lastOrder: "5 days ago", segment: "VIP", city: "Chennai", status: "Active" },
  { id: "c4", name: "Rohan Patel", email: "rohan@example.com", orders: 12, spend: 21400, lastOrder: "21 days ago", segment: "Frequent", city: "Ahmedabad", status: "At Risk" },
  { id: "c5", name: "Ananya Gupta", email: "ananya@example.com", orders: 3, spend: 4500, lastOrder: "95 days ago", segment: "Inactive", city: "Delhi", status: "Inactive" },
  { id: "c6", name: "Vikram Rao", email: "vikram@example.com", orders: 9, spend: 18750, lastOrder: "11 days ago", segment: "Frequent", city: "Hyderabad", status: "Active" },
  { id: "c7", name: "Priya Nair", email: "priya@example.com", orders: 15, spend: 33200, lastOrder: "1 day ago", segment: "VIP", city: "Kochi", status: "Active" },
  { id: "c8", name: "Karthik Menon", email: "karthik@example.com", orders: 4, spend: 6800, lastOrder: "48 days ago", segment: "At Risk", city: "Pune", status: "At Risk" },
];

export const segments = [
  { id: "s1", name: "Inactive Customers", count: 1245, avgSpend: 8400, engagement: 18, description: "No purchase in 60+ days" },
  { id: "s2", name: "VIP Customers", count: 312, avgSpend: 48200, engagement: 82, description: "Top 5% by lifetime spend" },
  { id: "s3", name: "Frequent Buyers", count: 980, avgSpend: 16500, engagement: 64, description: "4+ orders in last 90 days" },
  { id: "s4", name: "High Cart Value", count: 425, avgSpend: 28900, engagement: 47, description: "Avg order value above ₹5000" },
];

export type Campaign = {
  id: string;
  name: string;
  audience: string;
  audienceSize: number;
  channel: "WhatsApp" | "Email" | "SMS" | "RCS";
  status: "Draft" | "Running" | "Completed" | "Failed";
  openRate: number;
  ctr: number;
  message: string;
};

export const campaigns: Campaign[] = [
  { id: "cp1", name: "Diwali Reactivation", audience: "Inactive High-Value", audienceSize: 1245, channel: "WhatsApp", status: "Running", openRate: 72, ctr: 28, message: "Hi {{name}}, we missed you! Enjoy 20% OFF your next order." },
  { id: "cp2", name: "VIP Early Access", audience: "VIP Customers", audienceSize: 312, channel: "Email", status: "Completed", openRate: 84, ctr: 41, message: "Exclusive VIP preview — shop the new collection before anyone else." },
  { id: "cp3", name: "Cart Recovery", audience: "High Cart Value", audienceSize: 425, channel: "SMS", status: "Completed", openRate: 58, ctr: 22, message: "You left something behind. Complete your order in 1 tap." },
  { id: "cp4", name: "New Arrivals Push", audience: "Frequent Buyers", audienceSize: 980, channel: "RCS", status: "Draft", openRate: 0, ctr: 0, message: "Fresh drops just for you." },
  { id: "cp5", name: "Win-Back 45d", audience: "At Risk", audienceSize: 612, channel: "WhatsApp", status: "Failed", openRate: 0, ctr: 0, message: "Come back for 15% off." },
];

export const channelPerformance = [
  { channel: "WhatsApp", open: 72, ctr: 29 },
  { channel: "Email", open: 48, ctr: 18 },
  { channel: "SMS", open: 62, ctr: 22 },
  { channel: "RCS", open: 55, ctr: 24 },
];

export const predictionVsActual = [
  { campaign: "Diwali", predicted: 74, actual: 72 },
  { campaign: "VIP", predicted: 80, actual: 84 },
  { campaign: "Cart", predicted: 60, actual: 58 },
  { campaign: "Winter", predicted: 66, actual: 71 },
  { campaign: "Loyalty", predicted: 70, actual: 68 },
];

export const revenueAttribution = [
  { campaign: "Diwali Reactivation", revenue: 184000 },
  { campaign: "VIP Early Access", revenue: 312000 },
  { campaign: "Cart Recovery", revenue: 96000 },
  { campaign: "Loyalty Boost", revenue: 142000 },
];

export const performanceTrend = [
  { week: "W1", open: 52, ctr: 18, conv: 6 },
  { week: "W2", open: 58, ctr: 21, conv: 8 },
  { week: "W3", open: 61, ctr: 24, conv: 9 },
  { week: "W4", open: 67, ctr: 28, conv: 12 },
  { week: "W5", open: 63, ctr: 26, conv: 11 },
  { week: "W6", open: 72, ctr: 29, conv: 14 },
];
