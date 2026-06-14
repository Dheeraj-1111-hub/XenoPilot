import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }]
    });
    return response.choices[0]?.message?.content?.trim() || "Customer insight unavailable.";
  } catch (err) {
    console.error('Groq insight error:', err);
    return "Customer profile analyzed deterministically. Generative AI insight unavailable.";
  }
}
