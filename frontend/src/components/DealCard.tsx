"use client";

import React from 'react';
import Link from 'next/link';
import { Clock, ShoppingCart, Verified, Users, Star, MessageCircle, Share2 } from 'lucide-react';
import { Deal } from '@/lib/api';

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  const timeUntilExpiry = deal.expiryDate - Date.now();
  const daysLeft = Math.ceil(timeUntilExpiry / (1000 * 60 * 60 * 24));
  const progressPercentage = (deal.currentSupply / deal.maxSupply) * 100;

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Food: 'bg-orange-100 text-orange-800',
      Travel: 'bg-blue-100 text-blue-800',
      Health: 'bg-green-100 text-green-800',
      Shopping: 'bg-purple-100 text-purple-800',
      Entertainment: 'bg-pink-100 text-pink-800',
      Beauty: 'bg-rose-100 text-rose-800',
      Technology: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Deal Image */}
      <div className="relative h-48 bg-gradient-to-br from-purple-400 to-blue-500">
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(deal.category)}`}>
            {deal.category}
          </span>
        </div>
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          {deal.discountPercentage}% OFF
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <div className="text-white text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <div className="text-sm opacity-75">NFT Coupon</div>
          </div>
        </div>
      </div>

      {/* Deal Content */}
      <div className="p-6">
        {/* Merchant Info */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-600">{deal.merchant.name}</span>
          {deal.merchant.isVerified && (
            <Verified className="h-4 w-4 text-blue-500" />
          )}
        </div>

        {/* Deal Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {deal.title}
        </h3>

        {/* Deal Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {deal.description}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-green-600">
            {formatPrice(deal.discountedPrice)}
          </span>
          <span className="text-lg text-gray-400 line-through">
            {formatPrice(deal.originalPrice)}
          </span>
          <span className="text-sm text-green-600 font-medium">
            Save {formatPrice(deal.originalPrice - deal.discountedPrice)}
          </span>
        </div>

        {/* Supply Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {deal.currentSupply}/{deal.maxSupply} sold
            </span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Time Left */}
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
          <Clock className="h-4 w-4" />
          <span>
            {daysLeft > 0 ? `${daysLeft} days left` : 'Expires soon'}
          </span>
        </div>

        {/* Social Actions */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 hover:text-yellow-500 transition-colors">
              <Star className="h-4 w-4" />
              <span>4.8 (24)</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span>12</span>
            </button>
            <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link 
            href={`/deals/${deal.id}`}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Buy Now
          </Link>
          <Link 
            href={`/deals/${deal.id}`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}