import express from 'express';

const router = express.Router();

// Get platform analytics
router.get('/platform', (req, res) => {
  try {
    const analytics = {
      totalDeals: 1247,
      totalMerchants: 156,
      totalUsers: 15891,
      totalRevenue: 2300000,
      avgDealValue: 85,
      redemptionRate: 78.5,
      popularCategories: [
        { category: 'Food', count: 425, percentage: 34.1 },
        { category: 'Travel', count: 298, percentage: 23.9 },
        { category: 'Shopping', count: 267, percentage: 21.4 },
        { category: 'Health', count: 145, percentage: 11.6 },
        { category: 'Entertainment', count: 112, percentage: 9.0 }
      ],
      weeklyStats: [
        { week: 'Week 1', deals: 45, revenue: 12500 },
        { week: 'Week 2', deals: 52, revenue: 15800 },
        { week: 'Week 3', deals: 38, revenue: 9200 },
        { week: 'Week 4', deals: 61, revenue: 18900 }
      ]
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

// Get merchant analytics
router.get('/merchant/:walletAddress', (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const merchantAnalytics = {
      totalDeals: 12,
      totalSales: 2847,
      totalRevenue: 45782,
      avgDealValue: 16.08,
      redemptionRate: 85.2,
      topDeals: [
        { title: '50% Off Premium Coffee', sales: 75, revenue: 1500 },
        { title: 'Buy 2 Get 1 Free Pastries', sales: 42, revenue: 420 },
        { title: 'Coffee Subscription Deal', sales: 38, revenue: 1140 }
      ],
      salesByMonth: [
        { month: 'Jan', sales: 245, revenue: 3920 },
        { month: 'Feb', sales: 312, revenue: 4992 },
        { month: 'Mar', sales: 198, revenue: 3168 },
        { month: 'Apr', sales: 267, revenue: 4272 }
      ]
    };

    res.json({
      success: true,
      data: merchantAnalytics
    });

  } catch (error) {
    console.error('Error fetching merchant analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch merchant analytics'
    });
  }
});

export default router;