import { Campaign, campaigns as initialCampaigns } from "./mock-data";

let currentCampaigns = [...initialCampaigns];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export const campaignStore = {
  getCampaigns: () => currentCampaigns,
  addCampaign: (campaign: Campaign) => {
    currentCampaigns = [campaign, ...currentCampaigns];
    notify();
    simulateCampaignProgress(campaign.id);
  },
  updateCampaign: (id: string, updates: Partial<Campaign>) => {
    currentCampaigns = currentCampaigns.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    notify();
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

// Simulated Callback-Driven Architecture
// This simulates webhooks coming back from a messaging provider
function simulateCampaignProgress(id: string) {
  setTimeout(() => {
    campaignStore.updateCampaign(id, { openRate: 14 });
  }, 3000);

  setTimeout(() => {
    campaignStore.updateCampaign(id, { openRate: 42, ctr: 12 });
  }, 6000);

  setTimeout(() => {
    campaignStore.updateCampaign(id, { openRate: 68, ctr: 24 });
  }, 9000);

  setTimeout(() => {
    campaignStore.updateCampaign(id, { openRate: 74, ctr: 29, status: "Completed" });
  }, 12000);
}
