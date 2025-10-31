"use client";

import React from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ShoppingBag, Store, Search, User, TrendingUp } from 'lucide-react';

export default function Navbar() {
  const { connected } = useWallet();

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-2">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DealVault</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:ml-10 md:flex items-baseline space-x-8">
              <Link
                href="/marketplace"
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Marketplace</span>
              </Link>
              
              <Link
                href="/trending"
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Trending</span>
              </Link>

              {connected && (
                <>
                  <Link
                    href="/merchant"
                    className="flex items-center space-x-1 text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Store className="h-4 w-4" />
                    <span>Merchant Dashboard</span>
                  </Link>
                  
                  <Link
                    href="/profile"
                    className="flex items-center space-x-1 text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>My Coupons</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center">
            <WalletMultiButton className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg" />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/marketplace"
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
          >
            <Search className="h-4 w-4" />
            <span>Marketplace</span>
          </Link>
          
          <Link
            href="/trending"
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Trending</span>
          </Link>

          {connected && (
            <>
              <Link
                href="/merchant"
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              >
                <Store className="h-4 w-4" />
                <span>Merchant Dashboard</span>
              </Link>
              
              <Link
                href="/profile"
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              >
                <User className="h-4 w-4" />
                <span>My Coupons</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}