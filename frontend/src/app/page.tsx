"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Users, Shield, TrendingUp } from 'lucide-react';
import DealCard from '@/components/DealCard';
import { api, Deal, ExternalDeal } from '@/lib/api';

export default function Home() {
  const [featuredDeals, setFeaturedDeals] = useState<Deal[]>([]);
  const [externalDeals, setExternalDeals] = useState<ExternalDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        // Load featured deals from API
        const [dealsResponse, trendingResponse, externalResponse] = await Promise.all([
          api.getDeals({ limit: 3, sortBy: 'latest' }),
          api.getTrendingDeals(),
          api.getExternalDeals({ limit: 6 })
        ]);

        if (dealsResponse.success) {
          setFeaturedDeals(dealsResponse.data);
        }

        if (externalResponse.success) {
          setExternalDeals(externalResponse.data.slice(0, 3));
        }

      } catch (error) {
        console.error('Failed to load deals:', error);
        // Fallback to mock data if API fails
        setFeaturedDeals([]);
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              The Future of
              <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Deal Discovery
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Buy, sell, and trade NFT coupons on Solana. Every deal is a collectible, 
              every discount is tradeable, every coupon has real value.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/marketplace"
                className="bg-white text-purple-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                Explore Deals <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="/merchant"
                className="border-2 border-white text-white font-semibold px-8 py-3 rounded-xl hover:bg-white hover:text-purple-600 transition-colors"
              >
                Become a Merchant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why DealVault?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The first platform where deals become digital assets you can own, trade, and collect.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">NFT Coupons</h3>
              <p className="text-gray-600">Every deal is minted as a unique NFT that you truly own and can trade.</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Social Discovery</h3>
              <p className="text-gray-600">Rate, review, and share deals with the community for better discovery.</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Merchants</h3>
              <p className="text-gray-600">All merchants are verified on-chain ensuring authentic deals and redemption.</p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secondary Market</h3>
              <p className="text-gray-600">Sell unused coupons to others before they expire and recover value.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Deals Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Deals
            </h2>
            <p className="text-xl text-gray-600">
              Discover the hottest NFT deals trending in the community
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/marketplace"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              View All Deals <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">1,247</div>
              <div className="text-gray-600">Active Deals</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">$2.3M</div>
              <div className="text-gray-600">Total Savings</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">15,891</div>
              <div className="text-gray-600">Happy Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Saving?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Connect your Solana wallet and start discovering exclusive NFT deals today.
          </p>
          <Link 
            href="/marketplace"
            className="bg-white text-purple-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            Get Started <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
