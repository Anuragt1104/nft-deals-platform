"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  Plus, 
  BarChart3, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  Edit2,
  Trash2,
  Eye,
  QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock merchant data
const mockMerchantData = {
  name: "Bean & Brew Coffee Co.",
  description: "Premium coffee roastery serving the community since 2018",
  website: "https://beanandbrew.com",
  location: "San Francisco, CA",
  isVerified: true,
  totalDeals: 12,
  totalSales: 2847,
  totalRevenue: 45782,
  reputationScore: 95
};

// Mock deals data
const mockDeals = [
  {
    id: 1,
    title: "50% Off Premium Coffee",
    description: "Get half off your favorite premium coffee beans",
    originalPrice: 40,
    discountedPrice: 20,
    discountPercentage: 50,
    category: "Food",
    maxSupply: 100,
    currentSupply: 25,
    redeemed: 15,
    createdAt: "2024-10-20",
    expiryDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    isActive: true
  },
  {
    id: 2,
    title: "Buy 2 Get 1 Free Pastries",
    description: "Mix and match any pastries in our store",
    originalPrice: 15,
    discountedPrice: 10,
    discountPercentage: 33,
    category: "Food",
    maxSupply: 50,
    currentSupply: 30,
    redeemed: 8,
    createdAt: "2024-10-15",
    expiryDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
    isActive: true
  }
];

export default function MerchantDashboard() {
  const { connected } = useWallet();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateDeal, setShowCreateDeal] = useState(false);

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Please connect your Solana wallet to access the merchant dashboard
          </p>
        </div>
      </div>
    );
  }

  const handleCreateDeal = () => {
    toast.success("Deal creation feature coming soon!");
    setShowCreateDeal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Merchant Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Manage your NFT deals and track performance
              </p>
            </div>
            <button
              onClick={() => setShowCreateDeal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Create Deal
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deals</p>
                <p className="text-3xl font-bold text-gray-900">{mockMerchantData.totalDeals}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-3xl font-bold text-gray-900">{mockMerchantData.totalSales.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${mockMerchantData.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reputation</p>
                <p className="text-3xl font-bold text-gray-900">{mockMerchantData.reputationScore}%</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'deals', label: 'My Deals' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'profile', label: 'Profile' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {[
                      { action: "New coupon purchased", deal: "50% Off Premium Coffee", time: "2 hours ago" },
                      { action: "Deal created", deal: "Buy 2 Get 1 Free Pastries", time: "1 day ago" },
                      { action: "Coupon redeemed", deal: "Coffee Subscription Deal", time: "2 days ago" }
                    ].map((activity, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.deal}</p>
                        </div>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Deals Tab */}
            {activeTab === 'deals' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">My Deals</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 font-medium text-gray-900">Deal</th>
                        <th className="pb-3 font-medium text-gray-900">Price</th>
                        <th className="pb-3 font-medium text-gray-900">Sold</th>
                        <th className="pb-3 font-medium text-gray-900">Redeemed</th>
                        <th className="pb-3 font-medium text-gray-900">Expires</th>
                        <th className="pb-3 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockDeals.map((deal) => (
                        <tr key={deal.id} className="border-b">
                          <td className="py-4">
                            <div>
                              <p className="font-medium">{deal.title}</p>
                              <p className="text-sm text-gray-600">{deal.description}</p>
                            </div>
                          </td>
                          <td className="py-4">
                            <div>
                              <p className="font-medium">${deal.discountedPrice}</p>
                              <p className="text-sm text-gray-400 line-through">${deal.originalPrice}</p>
                            </div>
                          </td>
                          <td className="py-4">
                            <div>
                              <p className="font-medium">{deal.currentSupply}/{deal.maxSupply}</p>
                              <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-purple-600 h-2 rounded-full"
                                  style={{ width: `${(deal.currentSupply / deal.maxSupply) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="font-medium">{deal.redeemed}</span>
                          </td>
                          <td className="py-4">
                            <span className="text-sm text-gray-600">
                              {Math.ceil((deal.expiryDate - Date.now()) / (1000 * 60 * 60 * 24))} days
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex gap-2">
                              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                <QrCode className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Analytics</h3>
                <div className="text-center py-16 text-gray-500">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Detailed analytics coming soon!</p>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Merchant Profile</h3>
                <div className="max-w-2xl space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={mockMerchantData.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={mockMerchantData.description}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      readOnly
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={mockMerchantData.website}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={mockMerchantData.location}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Deal Modal */}
      {showCreateDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Deal</h3>
            <p className="text-gray-600 mb-6">
              Smart contract integration is currently being finalized. This feature will be available soon!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateDeal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDeal}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}