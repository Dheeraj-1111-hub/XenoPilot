const mongoose = require('mongoose');
require('dotenv/config');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Communication = mongoose.model('Communication', new mongoose.Schema({}, {strict: false}));

  console.time('agg');
  const [agg] = await Communication.aggregate([
    {
      $facet: {
        funnel: [
          {
            $group: {
              _id: null,
              audience: { $sum: 1 },
              sent: { $sum: { $cond: [{ $in: ['$status', ['Sent', 'Delivered', 'Opened', 'Clicked', 'Converted']] }, 1, 0] } },
              delivered: { $sum: { $cond: [{ $in: ['$status', ['Delivered', 'Opened', 'Clicked', 'Converted']] }, 1, 0] } },
              opened: { $sum: { $cond: [{ $in: ['$status', ['Opened', 'Clicked', 'Converted']] }, 1, 0] } },
              clicked: { $sum: { $cond: [{ $in: ['$status', ['Clicked', 'Converted']] }, 1, 0] } },
              converted: { $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] } },
              revenue: { $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, { $ifNull: ['$revenue', 0] }, 0] } },
              totalFailed: { $sum: { $cond: [{ $in: ['$status', ['Failed', 'Failed_Final']] }, 1, 0] } },
              totalCallbacks: { $sum: { $size: { $ifNull: ['$events', []] } } }
            }
          }
        ],
        channelStats: [
          {
            $group: {
              _id: { $ifNull: ['$channel', 'Email'] },
              sent: { $sum: { $cond: [{ $in: ['$status', ['Sent', 'Delivered', 'Opened', 'Clicked', 'Converted']] }, 1, 0] } },
              delivered: { $sum: { $cond: [{ $in: ['$status', ['Delivered', 'Opened', 'Clicked', 'Converted']] }, 1, 0] } },
              opened: { $sum: { $cond: [{ $in: ['$status', ['Opened', 'Clicked', 'Converted']] }, 1, 0] } },
              clicked: { $sum: { $cond: [{ $in: ['$status', ['Clicked', 'Converted']] }, 1, 0] } },
              converted: { $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] } }
            }
          }
        ],
        revenueByDay: [
          { $match: { status: 'Converted', revenue: { $gt: 0 } } },
          {
            $project: {
              revenue: 1,
              convertedDate: {
                $let: {
                  vars: {
                    convEvent: {
                      $arrayElemAt: [
                        { $filter: { input: { $ifNull: ['$events', []] }, as: 'e', cond: { $eq: ['$$e.status', 'Converted'] } } },
                        0
                      ]
                    }
                  },
                  in: { $ifNull: [{ $toDate: '$$convEvent.timestamp' }, { $toDate: '$convertedAt' }, new Date()] }
                }
              }
            }
          },
          {
            $group: {
              _id: { $dayOfWeek: '$convertedDate' },
              revenue: { $sum: '$revenue' }
            }
          }
        ]
      }
    }
  ]);
  console.timeEnd('agg');
  
  console.log(JSON.stringify(agg, null, 2));

  process.exit(0);
}).catch(console.error);
