import axios from 'axios';

interface DealFilters {
  category?: string;
  location?: string;
  minDiscount?: number;
  maxPrice?: number;
  limit?: number;
  [key: string]: any;
}

interface Deal {
  id: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  category: string;
  provider: string;
  url?: string;
  imageUrl?: string;
  expiryDate?: Date;
  location?: string;
  rating?: number;
}

// Mock data generators for demo purposes
// In production, these would be real API calls

export async function getFlightDeals(filters: DealFilters): Promise<Deal[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockFlights: Deal[] = [
    {
      id: 'flight-1',
      title: 'San Francisco to New York',
      description: 'Round-trip flight with major airline',
      originalPrice: 800,
      discountedPrice: 560,
      discountPercentage: 30,
      category: 'Travel',
      provider: 'SkyHigh Airlines',
      location: 'San Francisco → New York',
      rating: 4.2,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      imageUrl: '/api/placeholder/400/250'
    },
    {
      id: 'flight-2',
      title: 'Los Angeles to Miami',
      description: 'Direct flight, excellent service',
      originalPrice: 650,
      discountedPrice: 455,
      discountPercentage: 30,
      category: 'Travel',
      provider: 'AirWave',
      location: 'Los Angeles → Miami',
      rating: 4.5,
      expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      imageUrl: '/api/placeholder/400/250'
    },
    {
      id: 'flight-3',
      title: 'Chicago to Seattle',
      description: 'Economy class with complimentary meals',
      originalPrice: 450,
      discountedPrice: 315,
      discountPercentage: 30,
      category: 'Travel',
      provider: 'CloudLine',
      location: 'Chicago → Seattle',
      rating: 4.0,
      expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      imageUrl: '/api/placeholder/400/250'
    }
  ];

  return mockFlights.filter(flight => {
    if (filters.location && !flight.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.maxPrice && flight.discountedPrice > filters.maxPrice) {
      return false;
    }
    if (filters.minDiscount && flight.discountPercentage < filters.minDiscount) {
      return false;
    }
    return true;
  }).slice(0, filters.limit || 10);
}

export async function getHotelDeals(filters: DealFilters): Promise<Deal[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const mockHotels: Deal[] = [
    {
      id: 'hotel-1',
      title: 'Luxury Downtown Hotel',
      description: '4-star hotel in the heart of the city',
      originalPrice: 300,
      discountedPrice: 195,
      discountPercentage: 35,
      category: 'Travel',
      provider: 'Hotels.com',
      location: 'New York City',
      rating: 4.6,
      expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      imageUrl: '/api/placeholder/400/250'
    },
    {
      id: 'hotel-2',
      title: 'Beachfront Resort',
      description: 'All-inclusive resort with ocean views',
      originalPrice: 500,
      discountedPrice: 350,
      discountPercentage: 30,
      category: 'Travel',
      provider: 'Booking.com',
      location: 'Miami Beach',
      rating: 4.8,
      expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      imageUrl: '/api/placeholder/400/250'
    },
    {
      id: 'hotel-3',
      title: 'Mountain Lodge',
      description: 'Cozy lodge with stunning mountain views',
      originalPrice: 200,
      discountedPrice: 140,
      discountPercentage: 30,
      category: 'Travel',
      provider: 'Expedia',
      location: 'Colorado Springs',
      rating: 4.4,
      expiryDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      imageUrl: '/api/placeholder/400/250'
    }
  ];

  return mockHotels.filter(hotel => {
    if (filters.location && !hotel.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.maxPrice && hotel.discountedPrice > filters.maxPrice) {
      return false;
    }
    if (filters.minDiscount && hotel.discountPercentage < filters.minDiscount) {
      return false;
    }
    return true;
  }).slice(0, filters.limit || 10);
}

export async function getShoppingDeals(filters: DealFilters): Promise<Deal[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockShopping: Deal[] = [
    {
      id: 'shop-1',
      title: 'Designer Sunglasses',
      description: 'Premium designer sunglasses collection',
      originalPrice: 200,
      discountedPrice: 120,
      discountPercentage: 40,
      category: 'Shopping',
      provider: 'FashionHub',
      rating: 4.3,
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      imageUrl: '/api/placeholder/400/250'
    },
    {
      id: 'shop-2',
      title: 'Wireless Headphones',
      description: 'Noise-cancelling wireless headphones',
      originalPrice: 300,
      discountedPrice: 210,
      discountPercentage: 30,
      category: 'Technology',
      provider: 'TechDeals',
      rating: 4.7,
      expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      imageUrl: '/api/placeholder/400/250'
    },
    {
      id: 'shop-3',
      title: 'Running Shoes',
      description: 'Professional running shoes for athletes',
      originalPrice: 150,
      discountedPrice: 105,
      discountPercentage: 30,
      category: 'Shopping',
      provider: 'SportsMart',
      rating: 4.5,
      expiryDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      imageUrl: '/api/placeholder/400/250'
    }
  ];

  return mockShopping.filter(item => {
    if (filters.category && filters.category !== 'all' && 
        !item.category.toLowerCase().includes(filters.category.toLowerCase())) {
      return false;
    }
    if (filters.maxPrice && item.discountedPrice > filters.maxPrice) {
      return false;
    }
    if (filters.minDiscount && item.discountPercentage < filters.minDiscount) {
      return false;
    }
    return true;
  }).slice(0, filters.limit || 20);
}

export async function getRestaurantDeals(filters: DealFilters): Promise<Deal[]> {
  await new Promise(resolve => setTimeout(resolve, 350));
  
  const mockRestaurants: Deal[] = [
    {
      id: 'restaurant-1',
      title: 'Italian Bistro Special',
      description: '3-course dinner for two with wine pairing',
      originalPrice: 120,
      discountedPrice: 72,
      discountPercentage: 40,
      category: 'Food',
      provider: 'DineOut',
      location: 'Downtown',
      rating: 4.6,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      imageUrl: '/api/placeholder/400/250'
    },
    {
      id: 'restaurant-2',
      title: 'Sushi Master Class',
      description: 'All-you-can-eat sushi with sake tasting',
      originalPrice: 80,
      discountedPrice: 56,
      discountPercentage: 30,
      category: 'Food',
      provider: 'FoodieDeals',
      location: 'Midtown',
      rating: 4.8,
      expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      imageUrl: '/api/placeholder/400/250'
    },
    {
      id: 'restaurant-3',
      title: 'BBQ Feast',
      description: 'Texas-style BBQ platter with sides',
      originalPrice: 60,
      discountedPrice: 39,
      discountPercentage: 35,
      category: 'Food',
      provider: 'Groupon',
      location: 'Suburbs',
      rating: 4.4,
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      imageUrl: '/api/placeholder/400/250'
    }
  ];

  return mockRestaurants.filter(restaurant => {
    if (filters.location && !restaurant.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.maxPrice && restaurant.discountedPrice > filters.maxPrice) {
      return false;
    }
    if (filters.minDiscount && restaurant.discountPercentage < filters.minDiscount) {
      return false;
    }
    return true;
  }).slice(0, filters.limit || 15);
}

export async function getActivityDeals(filters: DealFilters): Promise<Deal[]> {
  await new Promise(resolve => setTimeout(resolve, 450));
  
  const mockActivities: Deal[] = [
    {
      id: 'activity-1',
      title: 'Concert Tickets',
      description: 'Live music performance by popular artist',
      originalPrice: 150,
      discountedPrice: 120,
      discountPercentage: 20,
      category: 'Entertainment',
      provider: 'TicketMaster',
      location: 'Arena District',
      rating: 4.7,
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      imageUrl: '/api/placeholder/400/250'
    },
    {
      id: 'activity-2',
      title: 'Spa Day Package',
      description: 'Full day spa treatment with massage and facial',
      originalPrice: 200,
      discountedPrice: 130,
      discountPercentage: 35,
      category: 'Health',
      provider: 'WellnessDeals',
      location: 'Wellness Center',
      rating: 4.9,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      imageUrl: '/api/placeholder/400/250'
    },
    {
      id: 'activity-3',
      title: 'Adventure Park Pass',
      description: 'Full access to adventure park activities',
      originalPrice: 75,
      discountedPrice: 52,
      discountPercentage: 30,
      category: 'Entertainment',
      provider: 'FunPark',
      location: 'Adventure Valley',
      rating: 4.5,
      expiryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      imageUrl: '/api/placeholder/400/250'
    }
  ];

  return mockActivities.filter(activity => {
    if (filters.location && !activity.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.maxPrice && activity.discountedPrice > filters.maxPrice) {
      return false;
    }
    if (filters.minDiscount && activity.discountPercentage < filters.minDiscount) {
      return false;
    }
    return true;
  }).slice(0, filters.limit || 10);
}

// In production, you would implement real API integrations like:

/*
// Example Skyscanner Flight API integration
export async function getSkyscannerFlights(filters: any) {
  const response = await axios.get('https://skyscanner-api.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/', {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'skyscanner-api.p.rapidapi.com'
    },
    params: {
      originplace: filters.origin,
      destinationplace: filters.destination,
      outboundpartialdate: filters.departDate
    }
  });
  
  return response.data.Quotes.map(quote => ({
    id: quote.QuoteId,
    title: `${quote.OutboundLeg.OriginPlace} to ${quote.OutboundLeg.DestinationPlace}`,
    originalPrice: quote.MinPrice * 1.2, // Assume 20% markup as original
    discountedPrice: quote.MinPrice,
    discountPercentage: 20,
    category: 'Travel',
    provider: 'Skyscanner'
  }));
}

// Example Booking.com Hotels API integration  
export async function getBookingHotels(filters: any) {
  const response = await axios.get('https://booking-com.p.rapidapi.com/v1/hotels/search', {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
    },
    params: {
      dest_type: 'city',
      dest_id: filters.destId,
      checkin_date: filters.checkIn,
      checkout_date: filters.checkOut,
      adults_number: filters.guests
    }
  });
  
  return response.data.result.map(hotel => ({
    id: hotel.hotel_id,
    title: hotel.hotel_name,
    originalPrice: hotel.min_total_price * 1.15,
    discountedPrice: hotel.min_total_price,
    discountPercentage: 15,
    category: 'Travel',
    provider: 'Booking.com',
    rating: hotel.review_score / 2 // Convert to 5-star scale
  }));
}
*/