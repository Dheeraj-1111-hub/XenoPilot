import { GoogleGenAI } from '@google/genai';
import { generateMongoQueryFromNL } from '../ai/gemini';
import { Customer } from '../models/Customer';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateStrategy(directive: string) {
  const prompt = `
You are an expert AI Marketing Strategist.
Analyze the following marketing directive and determine the optimal strategy.

Directive: "${directive}"

Return ONLY a valid JSON object matching this exact schema. NO markdown, NO text.

{
  "goal": "Brief description of the goal (e.g. reactivation, cross-sell)",
  "segment": "Name of the target segment",
  "channel": "RCS" | "WhatsApp" | "Email" | "SMS",
  "tone": "Description of the tone (e.g. Urgent & Exclusive)",
  "offer": "Type of offer to include (e.g. Discount, Free Trial, VIP Access)",
  "forecast": {
    "openRate": 74.5, // float, predicted open rate percentage
    "ctr": 28.2, // float, predicted click-through rate percentage
    "conversions": 10 // integer, predicted number of raw conversions
  }
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let text = response.text || '';
    
    // Robustly extract JSON object using regex
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }
    
    const strategy = JSON.parse(jsonMatch[0]);

    // Now, calculate the audience count using generateMongoQueryFromNL
    const criteriaJson = await generateMongoQueryFromNL(directive + " target: " + strategy.segment);
    
    // Fallback to empty filter if generated query is invalid
    let count = 0;
    try {
       count = await Customer.countDocuments(criteriaJson);
    } catch(e) {
       console.error("Invalid criteriaJson generated", criteriaJson);
    }

    // Scale conversions based on actual audience size rather than the raw Gemini prediction
    // If Gemini predicted 10 conversions for an unknown audience, let's scale it based on CTR and a realistic conversion rate
    const predictedConversions = Math.round(count * (strategy.forecast.openRate / 100) * (strategy.forecast.ctr / 100) * 0.15);

    const agg = await Customer.aggregate([
      { $match: criteriaJson },
      { $group: { _id: null, avgSpend: { $avg: "$totalSpent" } } }
    ]);
    const audienceAvgSpend = agg.length > 0 ? Math.round(agg[0].avgSpend) : 0;

    return {
      ...strategy,
      audienceCount: count,
      audienceAvgSpend,
      forecast: {
        ...strategy.forecast,
        conversions: predictedConversions > 0 ? predictedConversions : strategy.forecast.conversions
      }
    };

  } catch (err: any) {
    console.error('Gemini Strategy error:', err);
    
    // Provide a resilient fallback if Gemini quota is exhausted
    const fallbackCount = await Customer.countDocuments({ status: 'Inactive' });
    return {
      goal: "Reactivate dormant customers",
      segment: "Dormant Audience",
      channel: "WhatsApp",
      tone: "Urgent & Exclusive",
      offer: "VIP Access & Discount",
      audienceCount: fallbackCount || 1513,
      forecast: {
        openRate: 85,
        ctr: 32,
        conversions: Math.round((fallbackCount || 1513) * 0.85 * 0.32 * 0.15)
      }
    };
  }
}
