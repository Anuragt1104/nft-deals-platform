"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DealCard from '@/components/DealCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { api, Deal, ExternalDeal } from '@/lib/api';

// Mock data for marketplace deals (fallback)
const mockDeals: Deal[] = [
  {
    id: "1",
    title: "50% Off Premium Coffee",
    description: "Get half off your favorite premium coffee beans from our local roastery",
    originalPrice: 40,
    discountedPrice: 20,
    discountPercentage: 50,
    category: "Food",
    expiryDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    currentSupply: 25,
    maxSupply: 100,
    merchant: { id: "merchant-1", name: "Bean & Brew Coffee Co.", isVerified: true },
    isActive: true,
    createdAt: Date.now()
  },
  {
    id: "2",
    title: "25% Off Spa Treatment",
    description: "Relax and rejuvenate with our signature spa package",
    originalPrice: 200,
    discountedPrice: 150,
    discountPercentage: 25,
    category: "Health",
    expiryDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
    currentSupply: 8,
    maxSupply: 20,
    merchant: { id: "merchant-2", name: "Serenity Spa", isVerified: true },
    isActive: true,
    createdAt: Date.now()
  }
];

const categories = ["All", "Food", "Travel", "Health", "Technology", "Beauty", "Entertainment", "Shopping"];
const sortOptions = ["Latest", "Price: Low to High", "Price: High to Low", "Discount %", "Expiring Soon"];

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");
  const [showFilters, setShowFilters] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [externalDeals, setExternalDeals] = useState<ExternalDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load deals from API
  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true);
        setError(null);

        const [dealsResponse, externalResponse] = await Promise.all([
          api.getDeals({ limit: 20 }),
          api.getExternalDeals({ limit: 20 })
        ]);

        if (dealsResponse.success) {
          setDeals(dealsResponse.data);
        }

        if (externalResponse.success) {
          setExternalDeals(externalResponse.data);
        }

      } catch (err) {
        console.error('Failed to load deals:', err);
        setError('Failed to load deals. Using fallback data.');
        // Fallback to mock data
        setDeals(mockDeals);
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, []);

  // Combine platform deals and external deals
  const allDeals = [...deals, ...externalDeals.map(deal => ({
    ...deal,
    id: deal.id,
    currentSupply: 0,
    maxSupply: 100,
    merchant: {
      id: deal.provider,
      name: deal.provider,
      isVerified: false
    },
    isActive: true,
    createdAt: Date.now(),
    expiryDate: deal.expiryDate ? new Date(deal.expiryDate).getTime() : Date.now() + 30 * 24 * 60 * 60 * 1000
  }))];

  // Filter and sort deals
  const filteredDeals = allDeals
    .filter(deal => {
      const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           deal.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || deal.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "Price: Low to High":
          return a.discountedPrice - b.discountedPrice;
        case "Price: High to Low":
          return b.discountedPrice - a.discountedPrice;
        case "Discount %":
          return b.discountPercentage - a.discountPercentage;
        case "Expiring Soon":
          return a.expiryDate - b.expiryDate;
        default:
          return b.createdAt - a.createdAt; // Latest first
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">NFT Deal Marketplace</h1>
          <p className="text-lg text-gray-600">
            Discover and purchase exclusive NFT deals from verified merchants
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort and Filter Toggle */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters (collapsed by default) */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Range
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Any discount</option>
                    <option>10-25%</option>
                    <option>25-50%</option>
                    <option>50%+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>All deals</option>
                    <option>High availability (50%+ left)</option>
                    <option>Limited (25-50% left)</option>
                    <option>Almost sold out (&lt;25% left)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin h-12 w-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading amazing deals...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing {filteredDeals.length} deals
              </p>
            </div>

            {/* Deals Grid */}
            {filteredDeals.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No deals found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}

            {/* Load More Button */}
            {filteredDeals.length > 0 && (
              <div className="text-center mt-12">
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all">
                  Load More Deals
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}