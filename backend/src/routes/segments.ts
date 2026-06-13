import { Router } from 'express';
import { Segment } from '../models/Segment';
import { Customer } from '../models/Customer';
import { generateMongoQueryFromNL } from '../ai/gemini';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const segments = await Segment.find().lean().sort({ createdAt: -1 });
    const segmentsWithCounts = await Promise.all(segments.map(async (s: any) => {
      const count = await Customer.countDocuments(s.criteriaJson || {});
      return { ...s, count };
    }));
    res.json(segmentsWithCounts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/query', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    // Generate MongoDB JSON from English
    const criteriaJson = await generateMongoQueryFromNL(prompt);
    
    // Execute query to get audience size and sample
    const matches = await Customer.find(criteriaJson).limit(100).lean();
    const count = await Customer.countDocuments(criteriaJson);
    const agg = await Customer.aggregate([
      { $match: criteriaJson },
      { $group: { _id: null, avgSpend: { $avg: "$totalSpent" } } }
    ]);
    const avgSpend = agg.length > 0 ? Math.round(agg[0].avgSpend) : 0;

    res.json({
      criteriaJson,
      count,
      avgSpend,
      sample: matches
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, criteriaJson } = req.body;

    const segment = await Segment.findOneAndUpdate(
      { name }, // find by name
      { name, description, criteriaJson, createdBy: 'AI' }, // update
      { new: true, upsert: true } // create if not exists
    );
    
    res.json(segment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
