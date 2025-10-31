import express from 'express';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock deals database
const mockDeals = [
  {
    id: '1',
    title: '50% Off Premium Coffee',
    description: 'Get half off your favorite premium coffee beans from our local roastery',
    originalPrice: 40,
    discountedPrice: 20,
    discountPercentage: 50,
    category: 'Food',
    expiryDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    currentSupply: 25,
    maxSupply: 100,
    merchant: {
      id: 'merchant-1',
      name: 'Bean & Brew Coffee Co.',
      isVerified: true
    },
    isActive: true,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000
  },
  {
    id: '2', 
    title: '25% Off Spa Treatment',
    description: 'Relax and rejuvenate with our signature spa package',
    originalPrice: 200,
    discountedPrice: 150,
    discountPercentage: 25,
    category: 'Health',
    expiryDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
    currentSupply: 8,
    maxSupply: 20,
    merchant: {
      id: 'merchant-2',
      name: 'Serenity Spa',
      isVerified: true
    },
    isActive: true,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000
  }
];

// Get all deals with filtering and pagination
router.get('/', (req, res) => {
  try {
    const {
      category,
      minDiscount,
      maxPrice,
      sortBy = 'latest',
      page = 1,
      limit = 20
    } = req.query;

    let filteredDeals = [...mockDeals];

    // Apply filters
    if (category && category !== 'all') {
      filteredDeals = filteredDeals.filter(deal => 
        deal.category.toLowerCase() === (category as string).toLowerCase()
      );
    }

    if (minDiscount) {
      filteredDeals = filteredDeals.filter(deal => 
        deal.discountPercentage >= parseInt(minDiscount as string)
      );
    }

    if (maxPrice) {
      filteredDeals = filteredDeals.filter(deal => 
        deal.discountedPrice <= parseInt(maxPrice as string)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        filteredDeals.sort((a, b) => a.discountedPrice - b.discountedPrice);
        break;
      case 'price_high':
        filteredDeals.sort((a, b) => b.discountedPrice - a.discountedPrice);
        break;
      case 'discount':
        filteredDeals.sort((a, b) => b.discountPercentage - a.discountPercentage);
        break;
      case 'expiring':
        filteredDeals.sort((a, b) => a.expiryDate - b.expiryDate);
        break;
      default: // latest
        filteredDeals.sort((a, b) => b.createdAt - a.createdAt);
    }

    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedDeals = filteredDeals.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedDeals,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredDeals.length,
        totalPages: Math.ceil(filteredDeals.length / limitNum)
      },
      filters: {
        category,
        minDiscount,
        maxPrice,
        sortBy
      }
    });

  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deals'
    });
  }
});

// Get deal by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deal = mockDeals.find(d => d.id === id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    res.json({
      success: true,
      data: deal
    });

  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deal'
    });
  }
});

// Purchase deal (create coupon NFT)
router.post('/:id/purchase', async (req, res) => {
  try {
    const { id } = req.params;
    const { walletAddress, paymentMethod = 'SOL' } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }

    const deal = mockDeals.find(d => d.id === id);
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    if (!deal.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Deal is no longer active'
      });
    }

    if (deal.currentSupply >= deal.maxSupply) {
      return res.status(400).json({
        success: false,
        error: 'Deal is sold out'
      });
    }

    if (deal.expiryDate < Date.now()) {
      return res.status(400).json({
        success: false,
        error: 'Deal has expired'
      });
    }

    // Generate coupon
    const couponId = uuidv4();
    const coupon = {
      id: couponId,
      dealId: deal.id,
      dealTitle: deal.title,
      ownerWallet: walletAddress,
      purchasePrice: deal.discountedPrice,
      discountPercentage: deal.discountPercentage,
      isRedeemed: false,
      purchasedAt: Date.now(),
      expiryDate: deal.expiryDate,
      merchant: deal.merchant
    };

    // Generate QR code for redemption
    const qrData = JSON.stringify({
      couponId,
      dealId: deal.id,
      verificationCode: uuidv4().substr(0, 8).toUpperCase()
    });
    
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    // Update deal supply (in real app, this would be on-chain)
    deal.currentSupply += 1;

    res.json({
      success: true,
      data: {
        coupon,
        qrCode: qrCodeUrl,
        transaction: {
          id: uuidv4(),
          amount: deal.discountedPrice,
          currency: paymentMethod,
          status: 'completed',
          timestamp: Date.now()
        }
      },
      message: 'Deal purchased successfully!'
    });

  } catch (error) {
    console.error('Error purchasing deal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to purchase deal'
    });
  }
});

// Redeem coupon
router.post('/redeem', async (req, res) => {
  try {
    const { qrData, merchantWallet } = req.body;

    if (!qrData || !merchantWallet) {
      return res.status(400).json({
        success: false,
        error: 'QR data and merchant wallet are required'
      });
    }

    // Parse QR code data
    let couponData;
    try {
      couponData = JSON.parse(qrData);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Invalid QR code format'
      });
    }

    // Verify coupon (in real app, this would check blockchain)
    // For demo, we'll simulate successful redemption
    
    res.json({
      success: true,
      data: {
        couponId: couponData.couponId,
        dealId: couponData.dealId,
        redeemedAt: Date.now(),
        status: 'redeemed'
      },
      message: 'Coupon redeemed successfully!'
    });

  } catch (error) {
    console.error('Error redeeming coupon:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to redeem coupon'
    });
  }
});

// Get trending deals
router.get('/trending/popular', (req, res) => {
  try {
    // Sort by a combination of discount percentage and sales volume
    const trendingDeals = mockDeals
      .filter(deal => deal.isActive)
      .map(deal => ({
        ...deal,
        trendingScore: deal.discountPercentage * 0.6 + (deal.currentSupply / deal.maxSupply) * 40
      }))
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 10);

    res.json({
      success: true,
      data: trendingDeals
    });

  } catch (error) {
    console.error('Error fetching trending deals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending deals'
    });
  }
});

export default router;