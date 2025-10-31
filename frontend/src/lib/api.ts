const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Deal {
  id: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  category: string;
  expiryDate: number;
  currentSupply: number;
  maxSupply: number;
  merchant: {
    id: string;
    name: string;
    isVerified: boolean;
  };
  isActive: boolean;
  createdAt: number;
}

export interface ExternalDeal {
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
  expiryDate?: string;
  location?: string;
  rating?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: any;
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Deal endpoints
  async getDeals(params?: {
    category?: string;
    minDiscount?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Deal[]>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/deals${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<PaginatedResponse<Deal[]>>(endpoint);
  }

  async getDeal(id: string): Promise<ApiResponse<Deal>> {
    return this.request<ApiResponse<Deal>>(`/deals/${id}`);
  }

  async purchaseDeal(dealId: string, walletAddress: string, paymentMethod: string = 'SOL'): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/deals/${dealId}/purchase`, {
      method: 'POST',
      body: JSON.stringify({
        walletAddress,
        paymentMethod
      }),
    });
  }

  async redeemCoupon(qrData: string, merchantWallet: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/deals/redeem', {
      method: 'POST',
      body: JSON.stringify({
        qrData,
        merchantWallet
      }),
    });
  }

  async getTrendingDeals(): Promise<ApiResponse<Deal[]>> {
    return this.request<ApiResponse<Deal[]>>('/deals/trending/popular');
  }

  // External deals endpoints
  async getExternalDeals(params?: {
    category?: string;
    location?: string;
    minDiscount?: number;
    maxPrice?: number;
    limit?: number;
  }): Promise<ApiResponse<ExternalDeal[]>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/external/deals${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<ApiResponse<ExternalDeal[]>>(endpoint);
  }

  async getFlightDeals(params?: {
    origin?: string;
    destination?: string;
    departDate?: string;
    returnDate?: string;
    passengers?: number;
    limit?: number;
  }): Promise<ApiResponse<ExternalDeal[]>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/external/flights${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<ApiResponse<ExternalDeal[]>>(endpoint);
  }

  async getHotelDeals(params?: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    minRating?: number;
    limit?: number;
  }): Promise<ApiResponse<ExternalDeal[]>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/external/hotels${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<ApiResponse<ExternalDeal[]>>(endpoint);
  }

  async getShoppingDeals(params?: {
    category?: string;
    brand?: string;
    minDiscount?: number;
    maxPrice?: number;
    limit?: number;
  }): Promise<ApiResponse<ExternalDeal[]>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/external/shopping${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<ApiResponse<ExternalDeal[]>>(endpoint);
  }

  async getRestaurantDeals(params?: {
    location?: string;
    cuisine?: string;
    priceRange?: string;
    minRating?: number;
    limit?: number;
  }): Promise<ApiResponse<ExternalDeal[]>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/external/restaurants${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<ApiResponse<ExternalDeal[]>>(endpoint);
  }

  // Merchant endpoints
  async getMerchant(walletAddress: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/merchants/${walletAddress}`);
  }

  // Analytics endpoints
  async getPlatformAnalytics(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/analytics/platform');
  }

  async getMerchantAnalytics(walletAddress: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/analytics/merchant/${walletAddress}`);
  }
}

export const api = new ApiClient();