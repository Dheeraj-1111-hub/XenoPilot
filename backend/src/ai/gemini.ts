import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MongooseSchemaContext = `
Customer = {
  totalSpent: number,
  totalOrders: number,
  lastOrderDate: Date,
  status: 'Active' | 'Inactive' | 'At Risk',
  city: string
}
`;

export async function generateCampaignPlan(goal: string) {
  const prompt = `
You are an expert AI Marketing CRM.
The user wants to achieve this goal: "${goal}"

Database Context:
${MongooseSchemaContext}

Return ONLY a valid JSON object matching this schema. NO markdown, NO text.

{
  "intent": "Short name for the goal (e.g. Customer Reactivation)",
  "priority": "High" | "Medium" | "Low",
  "reasoningChain": [
    "Analyzing purchase frequency...",
    "Detecting churn signals...",
    "Selecting optimal channel..."
  ],
  "segmentName": "Name of the target audience",
  "segmentDescription": "Brief description of who they are",
  "criteriaJson": { "status": "Inactive" }, // Mongoose query object
  "channel": "WhatsApp" | "Email" | "SMS" | "RCS",
  "channelConfidence": 85, // Number between 0-100
  "messageTemplate": "The actual message copy using {{name}} for variables",
  "forecast": {
    "openRate": 68.4,
    "ctr": 24.5,
    "expectedRevenue": "₹2.4L"
  }
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    });
    
    let text = response.text || '';
    
    // Robustly extract JSON object using regex
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (err: any) {
    console.error('Gemini error:', err);
    throw new Error('Failed to generate plan from Gemini. Details: ' + err.message);
  }
}

export async function generateCustomerInsight(customerData: any) {
  const prompt = `
You are an expert AI Marketing Analyst.
Analyze the following customer data:
${JSON.stringify(customerData, null, 2)}

Provide a very brief (1-2 sentences max), actionable marketing insight for this specific customer.
Example: "High-value VIP at risk of churn. Recommend immediate 15% recovery offer."
Example: "Consistent purchaser. Ready for cross-sell into premium tier."

Return ONLY the insight text, without any quotes or markdown.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    });
    return response.text?.trim() || "No insight available.";
  } catch (err) {
    console.error('Gemini error:', err);
    return "Intelligence engine unavailable.";
  }
}

export async function generateMongoQueryFromNL(query: string) {
  const prompt = `
You are an expert MongoDB database administrator.
Convert this natural language query into a raw MongoDB query JSON for the Customer collection.
Query: "${query}"

Current Date Context: ${new Date().toISOString()}

Mongoose Schema Context:
Customer = {
  totalSpent: number,
  totalOrders: number,
  lastOrderDate: Date, // use ISO string format for date comparisons
  status: 'Active' | 'Inactive' | 'At Risk',
  city: string,
  age: number
}

Rules:
1. Return ONLY a valid JSON object. No markdown, no quotes outside the JSON.
2. Use valid MongoDB operators ($gt, $lt, $gte, $lte, $in).
3. If the query implies date math (e.g., "inactive 45 days"), calculate the exact ISO string threshold based on the Current Date Context provided above and use it in the query (e.g., { "lastOrderDate": { "$lt": "2024-..." } }).

Return ONLY the JSON.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    });
    let text = response.text || '';
    
    // Robustly extract JSON object using regex
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (err: any) {
    console.error('Gemini query error:', err.message);
    throw new Error('Failed to generate query from AI: ' + err.message);
  }
}
