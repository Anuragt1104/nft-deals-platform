import express from 'express';

const router = express.Router();

// Get merchant profile
router.get('/:walletAddress', (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Mock merchant data
    const mockMerchant = {
      walletAddress,
      name: "Bean & Brew Coffee Co.",
      description: "Premium coffee roastery serving the community since 2018",
      website: "https://beanandbrew.com",
      location: "San Francisco, CA",
      isVerified: true,
      totalDeals: 12,
      totalSales: 2847,
      totalRevenue: 45782,
      reputationScore: 95,
      joinedAt: Date.now() - 365 * 24 * 60 * 60 * 1000 // 1 year ago
    };

    res.json({
      success: true,
      data: mockMerchant
    });

  } catch (error) {
    console.error('Error fetching merchant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch merchant profile'
    });
  }
});

export default router;