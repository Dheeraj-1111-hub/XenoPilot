import { Router } from 'express';
import { generateCampaignPlan } from '../ai/gemini';

import { Customer } from '../models/Customer';

const router = Router();

router.post('/analyze-goal', async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ error: 'Goal is required' });

    const plan = await generateCampaignPlan(goal);
    
    // Evaluate audience against database
    const audienceSize = await Customer.countDocuments(plan.criteriaJson);
    
    // Calculate average historical spend for this audience
    const audienceStats = await Customer.aggregate([
      { $match: plan.criteriaJson || {} },
      { $group: { _id: null, avgSpend: { $avg: '$totalSpent' } } }
    ]);
    
    const audienceAvgSpend = audienceStats[0]?.avgSpend || 0;
    
    res.json({
      ...plan,
      audienceSize,
      audienceAvgSpend
    });
  } catch (err: any) {
    console.error('AI Error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
