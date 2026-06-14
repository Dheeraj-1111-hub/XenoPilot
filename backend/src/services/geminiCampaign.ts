import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

Write a compelling, highly-personalized multi-line marketing message (around 300-400 characters). Feel free to use emojis if appropriate for the channel.
Return ONLY the raw message text. Do not include quotes, markdown, or JSON.
`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }]
    });
    
    return response.choices[0]?.message?.content?.trim() || "Exclusive offer inside!";
  } catch (err: any) {
    if (err.status === 429) {
      console.warn('⚠️ [Copy] Groq API Quota Exceeded (429). Falling back to deterministic copy.');
    } else {
      console.error('Groq Copy error:', err.message || 'Unknown error');
    }
    return "Hi there! We miss you. Click here for an exclusive VIP discount to reactivate your account today!";
  }
}
