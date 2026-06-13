import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text?.trim() || "Campaign performed as expected. Consider scaling audience.";
  } catch (err: any) {
    console.error('Gemini Analytics error:', err);
    
    // Dynamic fallback if Gemini is rate limited
    const actualOpen = funnel.openRate || 0;
    const predictedOpen = prediction.predictedOpenRate || 0;
    
    if (actualOpen < predictedOpen) {
      return `Critical deviation detected. Campaign is underperforming against the ${predictedOpen}% predictive benchmark. Investigate channel viability.`;
    } else {
      return `Strong performance indicated. Campaign is exceeding the ${predictedOpen}% baseline prediction. Consider scaling this audience segment.`;
    }
  }
}
