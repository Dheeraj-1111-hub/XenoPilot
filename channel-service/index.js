const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory queue to simulate delivery states
// In a real system, this would be a message queue (e.g. RabbitMQ, SQS)
const communicationsInProgress = new Map();

// Helper to send callbacks to the CRM
const sendCallback = async (communicationId, status) => {
  try {
    const crmWebhookUrl = 'http://localhost:5000/api/callbacks/channel';
    const response = await fetch(crmWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ communicationId, status })
    });
    if (!response.ok) {
      console.error(`[Channel Service] Failed to send callback for ${communicationId}: ${response.status}`);
    } else {
      console.log(`[Channel Service] Callback sent: ${communicationId} is now ${status}`);
    }
  } catch (error) {
    console.error(`[Channel Service] Error sending callback for ${communicationId}:`, error.message);
  }
};

app.get('/health', (req, res) => {
  res.json({ status: 'ONLINE' });
});

app.post('/send', (req, res) => {
  const { communicationId, campaignId, customerId, channel, message, to } = req.body;
  
  if (!communicationId) {
    return res.status(400).json({ error: 'communicationId is required' });
  }

  // 1. Immediately accept the request
  res.status(202).json({ status: 'accepted', communicationId });
  console.log(`[Channel Service] Accepted communication ${communicationId} for campaign ${campaignId}`);

  // 2. Simulate asynchronous delivery lifecycle
  
  // Status: Sent
  setTimeout(() => {
    sendCallback(communicationId, 'sent');
  }, 1000 + Math.random() * 2000); // 1-3 seconds

  // Determine final fate: 
  // 10% Failed, 90% Delivered
  const fate = Math.random();
  
  if (fate < 0.1) {
    // Failed
    setTimeout(() => {
      sendCallback(communicationId, 'failed');
    }, 4000 + Math.random() * 3000); // 4-7 seconds
    return;
  }
  
  // Status: Delivered
  setTimeout(() => {
    sendCallback(communicationId, 'delivered');
  }, 4000 + Math.random() * 3000); // 4-7 seconds
  
  // Status: Opened (60% of delivered)
  const opened = Math.random();
  if (opened < 0.6) {
    setTimeout(() => {
      sendCallback(communicationId, 'opened');
    }, 8000 + Math.random() * 5000); // 8-13 seconds
    
    // Status: Clicked (20% of opened)
    const clicked = Math.random();
    if (clicked < 0.2) {
      setTimeout(() => {
        sendCallback(communicationId, 'clicked');
      }, 15000 + Math.random() * 10000); // 15-25 seconds
    }
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`[Channel Service] Stub service listening on port ${PORT}`);
});
