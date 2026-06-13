import axios from 'axios';

const CRM_CALLBACK_URL = 'http://localhost:5000/api/callbacks/events';

async function emitEvent(campaignId: string, customerId: string, event: string, retryCount: number = 0, revenue?: number) {
  try {
    await axios.post(CRM_CALLBACK_URL, {
      campaignId,
      customerId,
      event,
      timestamp: new Date().toISOString(),
      retryCount,
      revenue
    });
  } catch (err: any) {
    console.error(`[Channel Service] Callback Failed for ${event}:`, err.message);
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function simulateLifecycle(campaignId: string, customerId: string, channel: string, message: string) {
  let retryCount = 0;
  let delivered = false;

  // 1. Send Event (Immediate)
  await emitEvent(campaignId, customerId, 'Sent', retryCount);

  // 2. Delivery with Retry Logic
  while (retryCount < 3 && !delivered) {
    await delay(1500 + Math.random() * 2000); // 1.5 - 3.5 seconds
    
    // 5% chance of failure on any given attempt
    if (Math.random() < 0.05) {
      retryCount++;
      if (retryCount >= 3) {
        await emitEvent(campaignId, customerId, 'Failed_Final', retryCount);
        return; // End lifecycle for this customer
      } else {
        await emitEvent(campaignId, customerId, 'Failed', retryCount);
      }
    } else {
      delivered = true;
      await emitEvent(campaignId, customerId, 'Delivered', retryCount);
    }
  }

  // 3. Opened
  if (Math.random() < 0.70) {
    await delay(2000 + Math.random() * 5000); // 2 - 7 seconds
    await emitEvent(campaignId, customerId, 'Opened', retryCount);

    // 4. Clicked
    if (Math.random() < 0.25) {
      await delay(3000 + Math.random() * 6000); // 3 - 9 seconds
      await emitEvent(campaignId, customerId, 'Clicked', retryCount);

      // 5. Converted
      if (Math.random() < 0.05) {
        await delay(5000 + Math.random() * 10000); // 5 - 15 seconds
        const revenue = Math.floor(Math.random() * 4500) + 500; // 500 to 5000
        await emitEvent(campaignId, customerId, 'Converted', retryCount, revenue);
      }
    }
  }
}
