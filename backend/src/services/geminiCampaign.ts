import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateCopy(strategy: any) {
  const prompt = `
Create a high-converting marketing message based on the following strategy parameters.

Goal:
${strategy.goal}

Audience:
${strategy.segment}

Tone:
${strategy.tone}

Offer:
${strategy.offer}

Channel:
${strategy.channel}

Keep under 150 characters.
Return ONLY the raw message text. Do not include quotes, markdown, or JSON.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text?.trim() || "Exclusive offer inside!";
  } catch (err: any) {
    console.error('Gemini Copy error:', err);
    return "Hi there! We miss you. Click here for an exclusive VIP discount to reactivate your account today!";
  }
}
