import express from 'express';
import { 
  getFlightDeals, 
  getHotelDeals, 
  getShoppingDeals,
  getRestaurantDeals,
  getActivityDeals 
} from '../services/externalAPIs';

const router = express.Router();

// Get aggregated deals from all sources
router.get('/deals', async (req, res) => {
  try {
    const { category, location, minDiscount, maxPrice, limit = 20 } = req.query;
    
    const filters = {
      category: category as string,
      location: location as string,
      minDiscount: minDiscount ? parseInt(minDiscount as string) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
      limit: parseInt(limit as string)
    };

    let allDeals: any[] = [];

    // Fetch deals from different sources based on category
    if (!category || category === 'travel' || category === 'all') {
      const [flights, hotels] = await Promise.all([
        getFlightDeals(filters),
        getHotelDeals(filters)
      ]);
      allDeals.push(...flights, ...hotels);
    }

    if (!category || category === 'shopping' || category === 'all') {
      const shopping = await getShoppingDeals(filters);
      allDeals.push(...shopping);
    }

    if (!category || category === 'food' || category === 'all') {
      const restaurants = await getRestaurantDeals(filters);
      allDeals.push(...restaurants);
    }

    if (!category || category === 'entertainment' || category === 'all') {
      const activities = await getActivityDeals(filters);
      allDeals.push(...activities);
    }

    // Sort by discount percentage or relevance
    allDeals.sort((a, b) => b.discountPercentage - a.discountPercentage);

    // Limit results
    const limitedDeals = allDeals.slice(0, filters.limit);

    res.json({
      success: true,
      data: limitedDeals,
      count: limitedDeals.length,
      total: allDeals.length,
      filters: filters
    });

  } catch (error) {
    console.error('Error fetching external deals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deals from external sources',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get flight deals specifically
router.get('/flights', async (req, res) => {
  try {
    const filters = {
      origin: req.query.origin as string,
      destination: req.query.destination as string,
      departDate: req.query.departDate as string,
      returnDate: req.query.returnDate as string,
      passengers: req.query.passengers ? parseInt(req.query.passengers as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    };

    const deals = await getFlightDeals(filters);
    
    res.json({
      success: true,
      data: deals,
      count: deals.length
    });

  } catch (error) {
    console.error('Error fetching flight deals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flight deals'
    });
  }
});

// Get hotel deals specifically  
router.get('/hotels', async (req, res) => {
  try {
    const filters = {
      location: req.query.location as string,
      checkIn: req.query.checkIn as string,
      checkOut: req.query.checkOut as string,
      guests: req.query.guests ? parseInt(req.query.guests as string) : 2,
      minRating: req.query.minRating ? parseInt(req.query.minRating as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    };

    const deals = await getHotelDeals(filters);
    
    res.json({
      success: true,
      data: deals,
      count: deals.length
    });

  } catch (error) {
    console.error('Error fetching hotel deals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel deals'
    });
  }
});

// Get shopping deals
router.get('/shopping', async (req, res) => {
  try {
    const filters = {
      category: req.query.category as string,
      brand: req.query.brand as string,
      minDiscount: req.query.minDiscount ? parseInt(req.query.minDiscount as string) : undefined,
      maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20
    };

    const deals = await getShoppingDeals(filters);
    
    res.json({
      success: true,
      data: deals,
      count: deals.length
    });

  } catch (error) {
    console.error('Error fetching shopping deals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shopping deals'
    });
  }
});

// Get restaurant deals
router.get('/restaurants', async (req, res) => {
  try {
    const filters = {
      location: req.query.location as string,
      cuisine: req.query.cuisine as string,
      priceRange: req.query.priceRange as string,
      minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 15
    };

    const deals = await getRestaurantDeals(filters);
    
    res.json({
      success: true,
      data: deals,
      count: deals.length
    });

  } catch (error) {
    console.error('Error fetching restaurant deals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurant deals'
    });
  }
});

export default router;