import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateInsightText(spend: number, orders: number, inactiveDays: number, risk: string): Promise<string> {
  const prompt = `
You are a CRM analyst.
Generate a concise customer insight.

Customer Spend: ₹${spend}
Orders: ${orders}
Inactive: ${inactiveDays} days
Risk: ${risk}

Output: 2-3 lines only. Do not use quotes or markdown.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "Customer insight unavailable.";
  } catch (err) {
    console.error('Gemini insight error:', err);
    return "Customer profile analyzed deterministically. Generative AI insight unavailable.";
  }
}
