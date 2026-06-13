import mongoose from 'mongoose';
import 'dotenv/config';
import { Customer } from '../models/Customer';
import { Intelligence } from '../models/Intelligence';
import { calculateRisk } from '../services/riskEngine';
import { determineSegment } from '../services/segmentEngine';
import { recommendChannel } from '../services/channelEngine';
import { generateInsightText } from '../services/aiInsightService';

async function generateIntelligence() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/xenopilot';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB.');

  // Delete existing intelligence
  await Intelligence.deleteMany({});
  console.log('Cleared existing intelligence.');

  const customers = await Customer.find({});
  console.log(`Processing ${customers.length} customers...`);

  // We will process them in batches to not overwhelm the API rate limits if we use Gemini.
  // For the sake of this mock/prototype, we will only run Gemini on the first 50 customers.
  // The rest will get a default insight, because generating 10,000 LLM calls sequentially would take hours.
  
  let processed = 0;
  
  for (const customer of customers) {
    const riskLevel = calculateRisk(customer);
    const segment = determineSegment(customer);
    const { channel, action } = recommendChannel(customer);
    
    let inactiveDays = 0;
    if (customer.lastOrderDate) {
      inactiveDays = Math.floor((Date.now() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));
    }
    
    let insight = "Customer profile analyzed deterministically. Generative AI insight unavailable for bulk run.";
    
    if (processed < 50) {
      insight = await generateInsightText(customer.totalSpent, customer.totalOrders, inactiveDays, riskLevel);
    }
    
    const intel = new Intelligence({
      customerId: customer._id,
      riskLevel,
      segment,
      recommendedChannel: channel,
      recommendedAction: action,
      insight
    });
    
    await intel.save();
    
    processed++;
    if (processed % 1000 === 0) {
      console.log(`Processed ${processed} / ${customers.length}`);
    }
  }

  console.log('Finished generating intelligence for all customers.');
  mongoose.disconnect();
}

generateIntelligence().catch(console.error);
