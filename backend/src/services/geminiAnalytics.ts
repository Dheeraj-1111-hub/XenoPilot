import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateInsight(funnel: any, prediction: any) {
  const prompt = `
You are an expert CRM analyst at Xeno.
Analyze the following marketing campaign performance. Compare actuals vs predictions.
Keep your response under 50 words. Focus on actionable insights.

Actual Performance:
- Open Rate: ${funnel.openRate}%
- CTR: ${funnel.ctr}%
- Conversions: ${funnel.converted}

Predicted Performance:
- Open Rate: ${prediction.predictedOpenRate || 'N/A'}%
- CTR: ${prediction.predictedCTR || 'N/A'}%
- Conversions: ${prediction.predictedConversions || 'N/A'}
`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }]
    });
    
    return response.choices[0]?.message?.content?.trim() || "Campaign performed as expected. Consider scaling audience.";
  } catch (err: any) {
    if (err.status === 429) {
      console.warn('⚠️ [Analytics] Groq API Quota Exceeded (429). Falling back to deterministic insights.');
    } else {
      console.error('Groq Analytics error:', err.message || 'Unknown error');
    }
    
    // Dynamic fallback if Groq is rate limited
    const actualOpen = funnel.openRate || 0;
    const predictedOpen = prediction.predictedOpenRate || 0;
    
    if (actualOpen < predictedOpen) {
      return `Critical deviation detected. Campaign is underperforming against the ${predictedOpen}% predictive benchmark. Investigate channel viability.`;
    } else {
      return `Strong performance indicated. Campaign is exceeding the ${predictedOpen}% baseline prediction. Consider scaling this audience segment.`;
    }
  }
}
