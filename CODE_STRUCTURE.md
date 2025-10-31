# DealVault Code Structure

This document provides a detailed walkthrough of the entire codebase. We'll explain what each file does, how components connect, and the purpose of every major piece of code. Think of this as your guided tour through the project.

## Table of Contents

1. [Repository Overview](#repository-overview)
2. [Smart Contracts Deep Dive](#smart-contracts-deep-dive)
3. [Backend API Code](#backend-api-code)
4. [Frontend Code](#frontend-code)
5. [Configuration Files](#configuration-files)
6. [Key Code Patterns](#key-code-patterns)

## Repository Overview

```
nft-deals-platform/
│
├── smart-contracts/          # Solana smart contracts (Rust + Anchor)
│   ├── programs/            # Contract source code
│   ├── tests/               # Contract tests
│   ├── target/              # Compiled binaries and artifacts
│   ├── Anchor.toml          # Anchor configuration
│   ├── Cargo.toml           # Rust dependencies
│   └── package.json         # Node.js scripts for testing
│
├── api/                     # Backend REST API (Node.js + TypeScript)
│   ├── src/                # Source code
│   │   ├── index.ts        # Entry point
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Helper functions
│   ├── dist/               # Compiled JavaScript
│   ├── package.json        # Dependencies
│   ├── tsconfig.json       # TypeScript config
│   └── nodemon.json        # Dev server config
│
├── frontend/                # Next.js web application (React + TypeScript)
│   ├── src/                # Source code
│   │   ├── app/            # Next.js 16 app directory
│   │   │   ├── page.tsx    # Homepage
│   │   │   ├── layout.tsx  # Root layout
│   │   │   ├── marketplace/ # Marketplace pages
│   │   │   ├── merchant/   # Merchant dashboard
│   │   │   └── deals/      # Deal detail pages
│   │   ├── components/     # Reusable React components
│   │   └── lib/            # Utility libraries
│   ├── public/             # Static assets
│   ├── package.json        # Dependencies
│   ├── next.config.ts      # Next.js configuration
│   └── tsconfig.json       # TypeScript config
│
├── docs/                    # Additional documentation
├── scripts/                 # Utility scripts
├── deployment/             # Deployment configurations
├── README.md               # Main documentation (you are here!)
├── SETUP.md                # Setup instructions
├── ARCHITECTURE.md         # Architecture overview
└── CODE_STRUCTURE.md       # This file
```

## Smart Contracts Deep Dive

Location: `/smart-contracts/programs/smart-contracts/src/`

### lib.rs - Main Contract File

This is the heart of our blockchain logic. Let's break it down section by section.

**File Location:** `smart-contracts/programs/smart-contracts/src/lib.rs`

#### Program ID Declaration

```rust
declare_id!("11111111111111111111111111111112");
```

This is a placeholder ID. When you deploy the contract, Anchor generates a unique program ID that replaces this. The program ID is like the contract's address on the blockchain - it's how clients know where to send transactions.

#### The Main Program Module

```rust
#[program]
pub mod smart_contracts {
    use super::*;
    // ... functions here
}
```

The `#[program]` macro tells Anchor this is our main program module. Everything inside this module becomes a callable instruction on the blockchain.

#### Function 1: create_deal

**What it does:** Allows a merchant to create a new deal on the blockchain.

```rust
pub fn create_deal(
    ctx: Context<CreateDeal>,  // Contains all the accounts needed
    title: String,             // Deal title like "50% Off Coffee"
    description: String,       // Full description
    original_price: u64,       // Price in lamports (1 SOL = 1B lamports)
    discounted_price: u64,     // Discounted price in lamports
    discount_percentage: u8,   // Percentage (0-100)
    category: String,          // Category like "Food", "Travel"
    expiry_date: i64,         // Unix timestamp
    max_supply: u64,          // Maximum number of coupons
) -> Result<()> {
    // Get mutable reference to the deal account
    let deal = &mut ctx.accounts.deal;
    
    // Set the merchant who created this deal
    deal.authority = ctx.accounts.authority.key();
    
    // Copy all the parameters into the deal account
    deal.title = title;
    deal.description = description;
    deal.original_price = original_price;
    deal.discounted_price = discounted_price;
    deal.discount_percentage = discount_percentage;
    deal.category = category;
    deal.expiry_date = expiry_date;
    deal.max_supply = max_supply;
    
    // Initialize tracking fields
    deal.current_supply = 0;  // No sales yet
    deal.is_active = true;    // Deal is active
    deal.created_at = Clock::get()?.unix_timestamp;  // Current time
    
    // Log for debugging (visible in transaction logs)
    msg!("Deal created: {}", deal.title);
    
    Ok(())  // Success!
}
```

**How it's called from the frontend:**
```typescript
await program.methods
  .createDeal(
    "50% Off Coffee",
    "Get half off your favorite coffee",
    40_000_000, // 0.04 SOL
    20_000_000, // 0.02 SOL
    50,
    "Food",
    futureTimestamp,
    100
  )
  .accounts({
    deal: dealKeypair.publicKey,
    authority: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .signers([dealKeypair])
  .rpc();
```

#### Function 2: purchase_deal

**What it does:** When a user buys a deal, this creates a coupon NFT for them.

```rust
pub fn purchase_deal(
    ctx: Context<PurchaseDeal>,
) -> Result<()> {
    // Get references to the accounts we need
    let deal = &mut ctx.accounts.deal;
    
    // Validation checks (these will fail the transaction if false)
    require!(deal.is_active, DealError::DealNotActive);
    require!(
        deal.current_supply < deal.max_supply,
        DealError::DealSoldOut
    );
    require!(
        Clock::get()?.unix_timestamp < deal.expiry_date,
        DealError::DealExpired
    );
    
    // Create the coupon (this is the user's NFT!)
    let coupon = &mut ctx.accounts.coupon;
    coupon.deal_id = deal.key();              // Link to the deal
    coupon.owner = ctx.accounts.buyer.key(); // Who owns this coupon
    coupon.is_redeemed = false;               // Not used yet
    coupon.purchase_date = Clock::get()?.unix_timestamp;
    coupon.redemption_code = generate_redemption_code()?;
    
    // Update the deal's supply counter
    deal.current_supply += 1;
    
    msg!("Deal purchased! Coupon code: {}", coupon.redemption_code);
    
    Ok(())
}
```

**The beauty of this:** Once this transaction succeeds, the coupon exists on the blockchain forever (or until redeemed). No database, no server - it's just there, owned by the buyer's wallet.

#### Function 3: redeem_coupon

**What it does:** Merchants call this to redeem a coupon (mark it as used).

```rust
pub fn redeem_coupon(
    ctx: Context<RedeemCoupon>,
    redemption_code: String,  // The code from the QR
) -> Result<()> {
    let coupon = &mut ctx.accounts.coupon;
    let deal = &ctx.accounts.deal;
    
    // Security checks
    require!(
        !coupon.is_redeemed,
        DealError::CouponAlreadyRedeemed
    );
    require!(
        coupon.redemption_code == redemption_code,
        DealError::InvalidRedemptionCode
    );
    require!(
        Clock::get()?.unix_timestamp < deal.expiry_date,
        DealError::DealExpired
    );
    
    // Mark as redeemed (this is permanent!)
    coupon.is_redeemed = true;
    coupon.redemption_date = Some(Clock::get()?.unix_timestamp);
    
    msg!("Coupon redeemed successfully!");
    
    Ok(())
}
```

**Why this matters:** Once a coupon is marked as redeemed, it can never be used again. This enforcement happens at the blockchain level, so no one can cheat the system.

#### Account Structures

These define the data that gets stored on the blockchain.

```rust
#[derive(Accounts)]
pub struct CreateDeal<'info> {
    // The deal account we're creating
    #[account(
        init,              // Initialize new account
        payer = authority, // Merchant pays for account creation
        space = Deal::LEN  // How much space to allocate
    )]
    pub deal: Account<'info, Deal>,
    
    // The merchant creating the deal (must sign)
    #[account(mut)]
    pub authority: Signer<'info>,
    
    // System program (needed for creating accounts)
    pub system_program: Program<'info, System>,
}
```

**What `#[account(init)]` does:**
1. Creates a new account on Solana
2. Allocates rent (small SOL amount to keep account alive)
3. Sets the program as the owner of this account
4. Initializes it with default values

#### Data Models

```rust
#[account]
pub struct Deal {
    pub authority: Pubkey,        // 32 bytes
    pub title: String,            // Variable, max 64 chars
    pub description: String,      // Variable, max 256 chars
    pub original_price: u64,      // 8 bytes
    pub discounted_price: u64,    // 8 bytes
    pub discount_percentage: u8,  // 1 byte
    pub category: String,         // Variable, max 32 chars
    pub expiry_date: i64,        // 8 bytes
    pub max_supply: u64,         // 8 bytes
    pub current_supply: u64,     // 8 bytes
    pub is_active: bool,         // 1 byte
    pub created_at: i64,         // 8 bytes
}
```

**Size calculation:**
```rust
impl Deal {
    const LEN: usize = 8 +      // Anchor discriminator
        32 +                     // authority
        4 + 64 +                // title (4 bytes for length + 64 for content)
        4 + 256 +               // description
        8 +                     // original_price
        8 +                     // discounted_price
        1 +                     // discount_percentage
        4 + 32 +               // category
        8 +                     // expiry_date
        8 +                     // max_supply
        8 +                     // current_supply
        1 +                     // is_active
        8;                      // created_at
}
```

**Why size matters:** On Solana, you pay rent based on account size. Smaller accounts = lower costs. We pre-calculate the exact size needed.

#### Helper Functions

```rust
fn generate_redemption_code() -> Result<String> {
    let timestamp = Clock::get()?.unix_timestamp;
    Ok(format!("DEAL{}", timestamp % 1000000))
}
```

This creates a simple 6-digit code like "DEAL123456". In production, you'd want something more secure, but this works for demonstration.

### Anchor.toml - Configuration

**File Location:** `smart-contracts/Anchor.toml`

```toml
[programs.localnet]
smart_contracts = "2TfqdC8KVcDgEeN5EEF1GpFnmWTGr7woUiRnPNMoMoLC"
```

This maps the program name to its deployed address. When you deploy, this gets updated automatically.

```toml
[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"
```

This tells Anchor where your blockchain is (localnet = your computer) and which wallet to use for deployment.

### tests/smart-contracts.ts - Contract Tests

**File Location:** `smart-contracts/tests/smart-contracts.ts`

This file tests the smart contracts work correctly. Let's look at a typical test:

```typescript
describe("smart-contracts", () => {
  // Setup
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.SmartContracts;
  
  it("Creates a deal", async () => {
    // Generate a new keypair for the deal account
    const dealKeypair = anchor.web3.Keypair.generate();
    
    // Call create_deal
    await program.methods
      .createDeal(
        "Test Deal",
        "This is a test",
        100,
        50,
        50,
        "Food",
        Date.now() + 86400000,
        100
      )
      .accounts({
        deal: dealKeypair.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([dealKeypair])
      .rpc();
    
    // Verify the deal was created correctly
    const deal = await program.account.deal.fetch(
      dealKeypair.publicKey
    );
    
    assert.equal(deal.title, "Test Deal");
    assert.equal(deal.originalPrice.toNumber(), 100);
    assert.equal(deal.discountedPrice.toNumber(), 50);
  });
});
```

## Backend API Code

Location: `/api/src/`

### index.ts - Server Entry Point

**File Location:** `api/src/index.ts`

This is where the API server starts. Let's walk through it:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
```

**What each import does:**
- `express`: Web framework for building the API
- `cors`: Allows frontend (different domain) to call the API
- `helmet`: Security headers to protect against common attacks
- `morgan`: Logs all HTTP requests for debugging
- `dotenv`: Loads configuration from .env file

```typescript
// Middleware (runs on every request)
app.use(helmet());  // Security headers

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true  // Allow cookies
}));

app.use(morgan('combined'));  // Log requests
app.use(express.json());      // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));  // Parse form data
```

**Middleware order matters!** Each request passes through these in order.

```typescript
// Mount route handlers
app.use('/api/deals', dealsRoutes);
app.use('/api/merchants', merchantsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/external', externalAPIRoutes);
```

This means:
- Requests to `/api/deals/*` go to `dealsRoutes`
- Requests to `/api/merchants/*` go to `merchantsRoutes`
- etc.

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'DealVault API'
  });
});
```

This is useful for monitoring. You can ping `/health` to see if the server is running.

```typescript
// 404 handler (runs if no route matched)
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler (catches all errors)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

The error handler includes the stack trace only in development (security best practice).

```typescript
// Start the server
app.listen(PORT, () => {
  console.log(`🚀 DealVault API server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

### routes/deals.ts - Deal Endpoints

**File Location:** `api/src/routes/deals.ts`

This file handles all deal-related API endpoints.

```typescript
import express from 'express';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
```

**Router pattern:** Instead of defining routes on `app`, we use a router. This keeps code organized.

```typescript
// Mock data (in production, this comes from blockchain)
const mockDeals = [
  {
    id: '1',
    title: '50% Off Premium Coffee',
    description: 'Get half off your favorite premium coffee beans',
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
  // ... more deals
];
```

#### GET /api/deals - List All Deals

```typescript
router.get('/', (req, res) => {
  try {
    // Extract query parameters
    const {
      category,
      minDiscount,
      maxPrice,
      sortBy = 'latest',
      page = 1,
      limit = 20
    } = req.query;
    
    let filteredDeals = [...mockDeals];
    
    // Filter by category
    if (category && category !== 'all') {
      filteredDeals = filteredDeals.filter(deal => 
        deal.category.toLowerCase() === (category as string).toLowerCase()
      );
    }
    
    // Filter by minimum discount
    if (minDiscount) {
      filteredDeals = filteredDeals.filter(deal => 
        deal.discountPercentage >= parseInt(minDiscount as string)
      );
    }
    
    // Filter by maximum price
    if (maxPrice) {
      filteredDeals = filteredDeals.filter(deal => 
        deal.discountedPrice <= parseInt(maxPrice as string)
      );
    }
    
    // Sort deals
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
    
    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedDeals = filteredDeals.slice(startIndex, endIndex);
    
    // Return response with metadata
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
```

**Why this design?**
- Flexible filtering for user preferences
- Pagination prevents loading too much data
- Metadata helps frontend build UI (page numbers, totals, etc.)

#### POST /api/deals/:id/purchase - Purchase a Deal

```typescript
router.post('/:id/purchase', async (req, res) => {
  try {
    const { id } = req.params;
    const { walletAddress, paymentMethod = 'SOL' } = req.body;
    
    // Validate input
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }
    
    // Find the deal
    const deal = mockDeals.find(d => d.id === id);
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }
    
    // Validate deal status
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
    
    // Generate QR code
    const qrData = JSON.stringify({
      couponId,
      dealId: deal.id,
      verificationCode: uuidv4().substr(0, 8).toUpperCase()
    });
    
    const qrCodeUrl = await QRCode.toDataURL(qrData);
    
    // Update deal (in real app, this happens on blockchain)
    deal.currentSupply += 1;
    
    // Return success response
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
```

**What happens here:**
1. Extract deal ID from URL (`/api/deals/123/purchase` → id = '123')
2. Get wallet address from request body
3. Validate everything (deal exists, active, not sold out, not expired)
4. Create a coupon object
5. Generate QR code with coupon data
6. Update deal supply
7. Return coupon + QR code to user

### services/externalAPIs.ts - External Integration

**File Location:** `api/src/services/externalAPIs.ts`

This service fetches deals from external sources like Skyscanner, Booking.com, etc.

```typescript
import axios from 'axios';

// Types for external deals
interface ExternalDeal {
  id: string;
  source: string;  // Which API it came from
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  category: string;
  url: string;
  imageUrl?: string;
}

class ExternalAPIService {
  // Skyscanner integration (flights)
  async getFlightDeals(params: {
    origin?: string;
    destination?: string;
    limit?: number;
  }): Promise<ExternalDeal[]> {
    try {
      // In production, call real API
      const response = await axios.get(
        'https://api.skyscanner.com/deals',
        {
          headers: {
            'Authorization': `Bearer ${process.env.SKYSCANNER_API_KEY}`
          },
          params
        }
      );
      
      // Transform to our format
      return response.data.map(this.transformFlightDeal);
      
    } catch (error) {
      console.error('Skyscanner API error:', error);
      return []; // Fail gracefully
    }
  }
  
  // Transform external data to our format
  private transformFlightDeal(flightData: any): ExternalDeal {
    return {
      id: `flight-${flightData.id}`,
      source: 'skyscanner',
      title: `${flightData.origin} to ${flightData.destination}`,
      description: `Round trip flight for ${flightData.passengers} passengers`,
      originalPrice: flightData.regularPrice,
      discountedPrice: flightData.dealPrice,
      discountPercentage: Math.round(
        ((flightData.regularPrice - flightData.dealPrice) / flightData.regularPrice) * 100
      ),
      category: 'Travel',
      url: flightData.bookingUrl,
      imageUrl: flightData.airlineLogoUrl
    };
  }
  
  // Similar methods for hotels, shopping, etc.
}

export default new ExternalAPIService();
```

## Frontend Code

Location: `/frontend/src/`

### App Structure (Next.js 16)

Next.js 16 uses the App Router. Pages are defined by the folder structure.

```
src/app/
├── layout.tsx           # Root layout (wraps all pages)
├── page.tsx             # Homepage (/)
├── marketplace/
│   └── page.tsx        # Marketplace (/marketplace)
├── merchant/
│   └── page.tsx        # Merchant dashboard (/merchant)
└── deals/
    └── [id]/
        └── page.tsx    # Deal detail (/deals/:id)
```

### layout.tsx - Root Layout

**File Location:** `frontend/src/app/layout.tsx`

```typescript
import { Inter } from 'next/font/google';
import './globals.css';
import WalletContextProvider from '@/components/WalletContextProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'DealVault - NFT-Powered Deals',
  description: 'Buy, sell, and trade NFT coupons on Solana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
```

**What this does:**
- Loads Inter font from Google Fonts
- Sets page metadata (title, description for SEO)
- Wraps everything in WalletContextProvider (makes wallet available everywhere)
- Applies global styles from globals.css

### page.tsx - Homepage

**File Location:** `frontend/src/app/page.tsx`

```typescript
"use client";  // This is a client component (uses React hooks)

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Users, Shield, TrendingUp } from 'lucide-react';
import DealCard from '@/components/DealCard';
import { api, Deal, ExternalDeal } from '@/lib/api';

export default function Home() {
  // State for deals
  const [featuredDeals, setFeaturedDeals] = useState<Deal[]>([]);
  const [externalDeals, setExternalDeals] = useState<ExternalDeal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load deals when component mounts
  useEffect(() => {
    const loadDeals = async () => {
      try {
        // Call multiple APIs in parallel
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
        setFeaturedDeals([]); // Empty state on error
      } finally {
        setLoading(false);
      }
    };
    
    loadDeals();
  }, []); // Empty dependency array = run once on mount
  
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
            {/* Feature cards */}
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">NFT Coupons</h3>
              <p className="text-gray-600">
                Every deal is minted as a unique NFT that you truly own and can trade.
              </p>
            </div>
            
            {/* More feature cards... */}
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
      
      {/* More sections... */}
    </div>
  );
}
```

### components/DealCard.tsx - Deal Display Component

**File Location:** `frontend/src/components/DealCard.tsx`

This component displays a single deal card. It's reused throughout the app.

```typescript
"use client";

import React from 'react';
import Link from 'next/link';
import { Clock, ShoppingCart, Verified, Users, Star, MessageCircle, Share2 } from 'lucide-react';
import { Deal } from '@/lib/api';

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  // Calculate time until expiry
  const timeUntilExpiry = deal.expiryDate - Date.now();
  const daysLeft = Math.ceil(timeUntilExpiry / (1000 * 60 * 60 * 24));
  
  // Calculate supply progress
  const progressPercentage = (deal.currentSupply / deal.maxSupply) * 100;
  
  // Helper to format prices
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };
  
  // Get category color
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
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(deal.category)}`}>
            {deal.category}
          </span>
        </div>
        
        {/* Discount Badge */}
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          {deal.discountPercentage}% OFF
        </div>
        
        {/* Placeholder Icon */}
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
        
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {deal.title}
        </h3>
        
        {/* Description */}
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
        
        {/* Supply Progress Bar */}
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
        
        {/* Action Buttons */}
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
```

**Component features:**
- Responsive design (looks good on mobile and desktop)
- Visual indicators (discount badge, progress bar, time remaining)
- Social features (ratings, comments, shares)
- Hover effects for better UX
- Proper TypeScript types

### components/WalletContextProvider.tsx - Wallet Connection

**File Location:** `frontend/src/components/WalletContextProvider.tsx`

This makes Solana wallet connection available throughout the app.

```typescript
"use client";

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css');

interface Props {
  children: ReactNode;
}

const WalletContextProvider: FC<Props> = ({ children }) => {
  // Network endpoint (localnet for development)
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'http://localhost:8899',
    []
  );
  
  // Configure which wallets to support
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );
  
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
```

**How to use in components:**
```typescript
import { useWallet } from '@solana/wallet-adapter-react';

function MyComponent() {
  const { publicKey, connected, connect, disconnect } = useWallet();
  
  return (
    <div>
      {connected ? (
        <div>
          <p>Connected: {publicKey?.toBase58()}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

### lib/api.ts - API Client

**File Location:** `frontend/src/lib/api.ts`

This provides a clean interface for calling the backend API.

```typescript
// Types
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
  source: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  category: string;
  url: string;
  imageUrl?: string;
}

// API client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class APIClient {
  // Get deals with filtering
  async getDeals(params: {
    category?: string;
    minDiscount?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const queryString = new URLSearchParams(
      params as any
    ).toString();
    
    const response = await fetch(
      `${API_BASE_URL}/deals?${queryString}`
    );
    
    return response.json();
  }
  
  // Get single deal
  async getDeal(id: string) {
    const response = await fetch(`${API_BASE_URL}/deals/${id}`);
    return response.json();
  }
  
  // Purchase deal
  async purchaseDeal(dealId: string, walletAddress: string) {
    const response = await fetch(
      `${API_BASE_URL}/deals/${dealId}/purchase`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      }
    );
    
    return response.json();
  }
  
  // Get trending deals
  async getTrendingDeals() {
    const response = await fetch(
      `${API_BASE_URL}/deals/trending/popular`
    );
    
    return response.json();
  }
  
  // Get external deals
  async getExternalDeals(params: {
    category?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const queryString = new URLSearchParams(
      params as any
    ).toString();
    
    const response = await fetch(
      `${API_BASE_URL}/external/deals?${queryString}`
    );
    
    return response.json();
  }
}

export const api = new APIClient();
```

**Usage example:**
```typescript
import { api } from '@/lib/api';

// In a component
const loadDeals = async () => {
  const response = await api.getDeals({
    category: 'Food',
    minDiscount: 30,
    sortBy: 'discount',
    limit: 10
  });
  
  if (response.success) {
    setDeals(response.data);
  }
};
```

## Configuration Files

### package.json Files

Each part of the project has its own `package.json`:

**Smart Contracts:** `/smart-contracts/package.json`
```json
{
  "dependencies": {
    "@coral-xyz/anchor": "^0.31.1"  // Anchor framework
  },
  "devDependencies": {
    "typescript": "^5.7.3",          // TypeScript for tests
    "mocha": "^9.0.3",               // Test framework
    "chai": "^4.3.4"                 // Assertion library
  }
}
```

**Backend API:** `/api/package.json`
```json
{
  "dependencies": {
    "@coral-xyz/anchor": "^0.32.1",  // Smart contract interaction
    "@solana/web3.js": "^1.98.4",    // Solana SDK
    "express": "^5.1.0",              // Web framework
    "typescript": "^5.9.3",           // TypeScript
    "cors": "^2.8.5",                 // CORS middleware
    "dotenv": "^17.2.3",              // Environment variables
    "qrcode": "^1.5.4",               // QR code generation
    "axios": "^1.13.0"                // HTTP client
  }
}
```

**Frontend:** `/frontend/package.json`
```json
{
  "dependencies": {
    "next": "16.0.0",                           // Next.js framework
    "react": "19.2.0",                          // React library
    "@solana/wallet-adapter-react": "^0.15.39", // Wallet integration
    "@solana/web3.js": "^1.98.4",               // Solana SDK
    "tailwindcss": "^4",                        // Styling
    "lucide-react": "^0.548.0"                  // Icons
  }
}
```

### TypeScript Configuration

**tsconfig.json** (similar in all projects):
```json
{
  "compilerOptions": {
    "target": "ES2020",                // JavaScript version to compile to
    "module": "commonjs",              // Module system
    "lib": ["ES2020"],                 // JavaScript APIs available
    "outDir": "./dist",                // Where to put compiled files
    "rootDir": "./src",                // Where source files are
    "strict": true,                    // Enable strict type checking
    "esModuleInterop": true,          // Compatibility with CommonJS
    "skipLibCheck": true,             // Skip type checking of libraries
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],            // Files to compile
  "exclude": ["node_modules", "dist"] // Files to ignore
}
```

## Key Code Patterns

### Error Handling Pattern

Throughout the codebase, we use try-catch for error handling:

```typescript
try {
  // Attempt operation
  const result = await riskyOperation();
  
  // Success path
  return { success: true, data: result };
  
} catch (error) {
  // Error path
  console.error('Operation failed:', error);
  
  return {
    success: false,
    error: error.message || 'Operation failed'
  };
}
```

### Validation Pattern

Input validation is done at multiple layers:

```typescript
// 1. Frontend validation
if (!dealTitle || dealTitle.length < 3) {
  throw new Error('Title must be at least 3 characters');
}

// 2. API validation
if (!req.body.walletAddress) {
  return res.status(400).json({
    success: false,
    error: 'Wallet address is required'
  });
}

// 3. Smart contract validation
require!(
  discounted_price < original_price,
  ErrorCode::InvalidPrice
);
```

### Async/Await Pattern

For asynchronous operations:

```typescript
// Good: Multiple parallel operations
const [deals, merchants, analytics] = await Promise.all([
  api.getDeals(),
  api.getMerchants(),
  api.getAnalytics()
]);

// Good: Sequential when needed
const deal = await api.getDeal(id);
const coupon = await api.purchaseDeal(deal.id, wallet);
const qr = await generateQR(coupon);
```

### Component Composition Pattern

React components are composed hierarchically:

```typescript
<Page>
  <Navbar />
  <Hero />
  <Section>
    <Container>
      {deals.map(deal => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </Container>
  </Section>
</Page>
```

## Summary

This codebase follows modern best practices:

1. **Separation of Concerns**: Smart contracts, API, and frontend are independent
2. **Type Safety**: TypeScript everywhere for fewer bugs
3. **Error Handling**: Comprehensive error handling at every layer
4. **Modularity**: Reusable components and services
5. **Documentation**: Code is well-commented
6. **Testing**: Tests for smart contracts ensure correctness

Each file has a specific purpose, and the structure is logical and easy to navigate. The code is production-ready with room for scaling and feature additions.

For more information:
- Architecture decisions: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Setup instructions: [SETUP.md](./SETUP.md)
- Project overview: [README.md](./README.md)

