# DealVault Architecture

This document explains the technical architecture of DealVault, including design decisions, data flow, and how all the components work together. We'll explain everything in plain terms while diving deep into the technical details.

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Architecture Layers](#architecture-layers)
3. [Smart Contract Design](#smart-contract-design)
4. [Backend API Design](#backend-api-design)
5. [Frontend Architecture](#frontend-architecture)
6. [Data Flow](#data-flow)
7. [Security Considerations](#security-considerations)
8. [Design Decisions](#design-decisions)
9. [Scalability Considerations](#scalability-considerations)

## High-Level Overview

DealVault follows a three-tier architecture with Web3 integration:

```
┌────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│                     (Next.js + React + Web3)                   │
│   - User Interface (deals, marketplace, merchant dashboard)    │
│   - Wallet Integration (Phantom, Solflare)                     │
│   - Client-side validation and state management                │
└────────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTP/REST + WebSocket
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                       Backend API Layer                         │
│                    (Node.js + Express + TS)                    │
│   - REST API endpoints                                         │
│   - Business logic and validation                              │
│   - External API integration (travel, shopping deals)          │
│   - QR code generation                                         │
└────────────────────────────────────────────────────────────────┘
                              ▲
                              │ JSON-RPC + Anchor SDK
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                    Smart Contract Layer                         │
│                      (Solana + Anchor)                         │
│   - Deal creation and management                               │
│   - NFT coupon minting and transfer                            │
│   - Redemption verification                                    │
│   - Merchant profiles and reputation                           │
└────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                      Solana Blockchain                          │
│   - Permanent transaction ledger                               │
│   - Account state storage                                      │
│   - Consensus and validation                                   │
└────────────────────────────────────────────────────────────────┘
```

## Architecture Layers

### Layer 1: Solana Blockchain

The foundation of DealVault is the Solana blockchain, which provides:

**Key Characteristics:**
- **Speed**: ~400ms block time, 65,000 TPS theoretical capacity
- **Cost**: Extremely low transaction fees (~$0.00025 per transaction)
- **Finality**: Fast transaction confirmation
- **Account Model**: Different from Ethereum's contract-centric model

**Why Solana?**
1. **Low Fees**: Essential for microtransactions in deals/coupons
2. **Speed**: Users expect instant confirmation when purchasing deals
3. **NFT Support**: Native token program makes NFT creation efficient
4. **Growing Ecosystem**: Strong developer community and tooling

### Layer 2: Smart Contracts (Anchor Framework)

Our smart contracts are the core business logic of DealVault.

**Technology Stack:**
- **Language**: Rust (compiled to BPF bytecode)
- **Framework**: Anchor 0.32.1
- **Standard**: Custom account structure (not using Metaplex for simplicity)

**Core Contracts:**

1. **Deal Program**: Manages deal lifecycle
2. **Coupon Program**: NFT coupon creation and tracking
3. **Merchant Program**: Merchant profiles and verification
4. **Redemption Program**: Verifies and processes redemptions

### Layer 3: Backend API

The API layer bridges Web2 and Web3 functionality.

**Technology Stack:**
- **Runtime**: Node.js 18+
- **Framework**: Express 5.1.0
- **Language**: TypeScript 5.9.3
- **Web3 SDK**: @solana/web3.js, @coral-xyz/anchor

**Responsibilities:**
- Provide REST endpoints for the frontend
- Aggregate deals from external APIs
- Generate QR codes for redemption
- Cache blockchain data for performance
- Handle authentication and rate limiting

### Layer 4: Frontend Application

The user-facing interface for all interactions.

**Technology Stack:**
- **Framework**: Next.js 16.0.0 (React 19.2.0)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Wallet Integration**: Solana Wallet Adapter
- **State Management**: React hooks + context

**Key Features:**
- Server-side rendering for SEO
- Wallet connectivity abstraction
- Responsive design for mobile/desktop
- Real-time deal updates

## Smart Contract Design

Let's dive deep into how our smart contracts work.

### Account Structure

Solana uses an account-based model. Each piece of data lives in an account.

**Deal Account:**
```rust
pub struct Deal {
    pub authority: Pubkey,           // Merchant who created this deal (32 bytes)
    pub title: String,               // Deal title (4 + 64 bytes)
    pub description: String,         // Deal description (4 + 256 bytes)
    pub original_price: u64,         // Original price in lamports (8 bytes)
    pub discounted_price: u64,       // Discounted price in lamports (8 bytes)
    pub discount_percentage: u8,     // Discount % (1 byte)
    pub category: String,            // Category like "Food", "Travel" (4 + 32 bytes)
    pub expiry_date: i64,           // Unix timestamp (8 bytes)
    pub max_supply: u64,            // Maximum number of coupons (8 bytes)
    pub current_supply: u64,        // Current number sold (8 bytes)
    pub is_active: bool,            // Whether deal is active (1 byte)
    pub created_at: i64,            // Creation timestamp (8 bytes)
}
```

**Total size**: ~450 bytes (fixed allocation for predictable rent)

**Coupon Account:**
```rust
pub struct Coupon {
    pub deal_id: Pubkey,             // Reference to deal account (32 bytes)
    pub owner: Pubkey,               // Current owner's wallet (32 bytes)
    pub is_redeemed: bool,           // Redemption status (1 byte)
    pub purchase_date: i64,          // When purchased (8 bytes)
    pub redemption_date: Option<i64>, // When redeemed, if applicable (9 bytes)
    pub redemption_code: String,     // Unique code for QR (4 + 32 bytes)
}
```

**Total size**: ~118 bytes

**Merchant Account:**
```rust
pub struct Merchant {
    pub authority: Pubkey,           // Merchant's wallet (32 bytes)
    pub name: String,                // Business name (4 + 64 bytes)
    pub description: String,         // Business description (4 + 256 bytes)
    pub website: String,             // Website URL (4 + 128 bytes)
    pub location: String,            // Physical location (4 + 128 bytes)
    pub is_verified: bool,           // Verification status (1 byte)
    pub total_deals: u64,            // Number of deals created (8 bytes)
    pub total_sales: u64,            // Total sales count (8 bytes)
    pub reputation_score: u64,       // Community reputation (8 bytes)
    pub created_at: i64,             // Creation timestamp (8 bytes)
}
```

**Total size**: ~653 bytes

### Smart Contract Functions

#### 1. Create Deal

```rust
pub fn create_deal(
    ctx: Context<CreateDeal>,
    title: String,
    description: String,
    original_price: u64,
    discounted_price: u64,
    discount_percentage: u8,
    category: String,
    expiry_date: i64,
    max_supply: u64,
) -> Result<()>
```

**What it does:**
1. Creates a new Deal account
2. Initializes all fields with provided data
3. Sets the merchant (authority) as the signer
4. Marks deal as active
5. Records creation timestamp

**Access control:**
- Only the signer can create deals under their authority
- No special permissions needed (anyone can be a merchant)

**Cost:**
- Rent for Deal account: ~0.003 SOL
- Transaction fee: ~0.000005 SOL
- Total: ~0.003005 SOL (~$0.30 at $100/SOL)

#### 2. Purchase Deal

```rust
pub fn purchase_deal(
    ctx: Context<PurchaseDeal>,
) -> Result<()>
```

**What it does:**
1. Validates the deal is active, not expired, not sold out
2. Creates a new Coupon account owned by the buyer
3. Generates a unique redemption code
4. Increments the deal's current_supply counter
5. Records purchase timestamp

**Validations:**
- `require!(deal.is_active)` - Deal must be active
- `require!(deal.current_supply < deal.max_supply)` - Must have supply available
- `require!(Clock::get()?.unix_timestamp < deal.expiry_date)` - Must not be expired

**Payment flow:**
In the current implementation, payment happens off-chain (via the API). In production, you'd add:
```rust
// Transfer SOL from buyer to merchant
invoke(
    &system_instruction::transfer(
        &ctx.accounts.buyer.key(),
        &ctx.accounts.merchant.key(),
        deal.discounted_price,
    ),
    &[...],
)?;
```

#### 3. Redeem Coupon

```rust
pub fn redeem_coupon(
    ctx: Context<RedeemCoupon>,
    redemption_code: String,
) -> Result<()>
```

**What it does:**
1. Verifies the coupon hasn't been redeemed
2. Validates the redemption code matches
3. Checks the deal hasn't expired
4. Marks coupon as redeemed
5. Records redemption timestamp

**Security:**
- Only the merchant can redeem coupons for their deals
- Redemption code must match exactly
- Single-use enforcement via `is_redeemed` flag

#### 4. Create Merchant Profile

```rust
pub fn create_merchant_profile(
    ctx: Context<CreateMerchantProfile>,
    name: String,
    description: String,
    website: String,
    location: String,
) -> Result<()>
```

**What it does:**
1. Creates an on-chain merchant profile
2. Initializes reputation tracking
3. Sets verification status to false (requires admin verification)

### Error Handling

Custom error codes provide clear feedback:

```rust
#[error_code]
pub enum DealError {
    #[msg("Deal is not active")]
    DealNotActive,
    
    #[msg("Deal is sold out")]
    DealSoldOut,
    
    #[msg("Deal has expired")]
    DealExpired,
    
    #[msg("Coupon has already been redeemed")]
    CouponAlreadyRedeemed,
    
    #[msg("Invalid redemption code")]
    InvalidRedemptionCode,
}
```

These get returned to the frontend as human-readable messages.

### Account Relationships

```
Merchant Account
    │
    ├─► Deal Account #1
    │       └─► Coupon #1 (Owner: User A)
    │       └─► Coupon #2 (Owner: User B)
    │       └─► Coupon #3 (Owner: User C)
    │
    ├─► Deal Account #2
    │       └─► Coupon #4 (Owner: User D)
    │
    └─► Deal Account #3
            └─► Coupon #5 (Owner: User A)
```

Each account is independent but linked via public keys.

## Backend API Design

### Architecture Pattern

The API follows a clean, layered architecture:

```
Routes Layer (HTTP endpoints)
    │
    ├─► Controllers (Request handling)
    │       │
    │       └─► Services (Business logic)
    │               │
    │               ├─► Blockchain Service (Solana interaction)
    │               ├─► External API Service (Third-party APIs)
    │               └─► Utility Services (QR, validation, etc.)
```

### API Endpoints

#### Deal Routes (`/api/deals`)

**GET /api/deals**
- Lists all deals with filtering and pagination
- Query params: `category`, `minDiscount`, `maxPrice`, `sortBy`, `page`, `limit`
- Response: Paginated deal list with metadata

**GET /api/deals/:id**
- Gets a specific deal by ID
- Response: Full deal details including merchant info

**POST /api/deals/:id/purchase**
- Purchases a deal and mints a coupon NFT
- Body: `{ walletAddress, paymentMethod }`
- Response: Coupon details, QR code, transaction info

**POST /api/deals/redeem**
- Redeems a coupon via QR code
- Body: `{ qrData, merchantWallet }`
- Response: Redemption confirmation

**GET /api/deals/trending/popular**
- Gets trending deals based on popularity
- Response: List of trending deals

#### Merchant Routes (`/api/merchants`)

**POST /api/merchants**
- Creates a new merchant profile
- Body: Merchant details
- Response: Created merchant account

**GET /api/merchants/:id**
- Gets merchant profile and statistics
- Response: Merchant details, deals, performance metrics

**PUT /api/merchants/:id**
- Updates merchant profile
- Body: Updated fields
- Response: Updated merchant profile

#### Analytics Routes (`/api/analytics`)

**GET /api/analytics/deals/:id**
- Gets analytics for a specific deal
- Response: Views, purchases, redemptions, revenue

**GET /api/analytics/merchants/:id**
- Gets merchant analytics
- Response: Total sales, popular deals, trends

#### External API Routes (`/api/external`)

**GET /api/external/deals**
- Aggregates deals from external sources
- Query params: `category`, `limit`, `offset`
- Response: Combined deals from multiple APIs

### External API Integration

The platform aggregates deals from multiple sources:

```typescript
// Example integration pattern
class ExternalAPIService {
  async getFlightDeals() {
    // Integrate with Skyscanner API
    const response = await axios.get(
      'https://skyscanner-api.com/deals',
      { headers: { 'Authorization': `Bearer ${API_KEY}` } }
    );
    
    // Transform to our format
    return response.data.map(transformFlightDeal);
  }
  
  async getHotelDeals() {
    // Integrate with Booking.com API
    // Similar pattern
  }
  
  async getShoppingDeals() {
    // Integrate with Shopify/shopping APIs
    // Similar pattern
  }
}
```

**APIs we can integrate:**
1. **Travel**: Skyscanner, Booking.com, Kayak APIs
2. **Shopping**: Shopify, Amazon Product Advertising API
3. **Dining**: Yelp, OpenTable deals
4. **Entertainment**: Ticketmaster, Eventbrite

### QR Code Generation

Redemption uses QR codes for easy merchant verification:

```typescript
import QRCode from 'qrcode';

async function generateRedemptionQR(coupon) {
  const data = JSON.stringify({
    couponId: coupon.id,
    dealId: coupon.dealId,
    verificationCode: generateSecureCode(),
    timestamp: Date.now()
  });
  
  // Generate QR code as data URL
  const qrCodeUrl = await QRCode.toDataURL(data);
  
  return qrCodeUrl;
}
```

The QR code contains:
- Coupon ID (to look up in blockchain)
- Deal ID (for validation)
- Verification code (for additional security)
- Timestamp (to prevent replay attacks)

### Caching Strategy

To improve performance, we cache blockchain data:

```
User Request
    │
    ├─► Check Cache (Redis)
    │       │
    │       ├─► Cache Hit: Return cached data
    │       │
    │       └─► Cache Miss: Fetch from blockchain
    │                       └─► Store in cache
    │                       └─► Return data
```

**Cache durations:**
- Deals list: 30 seconds (updates frequently)
- Deal details: 1 minute (changes on purchases)
- Merchant profiles: 5 minutes (rarely changes)
- Analytics: 5 minutes (computed data)

## Frontend Architecture

### Component Structure

```
app/
├── page.tsx                    # Homepage
├── layout.tsx                  # Root layout
├── marketplace/
│   └── page.tsx               # Deal marketplace
├── merchant/
│   └── page.tsx               # Merchant dashboard
└── deals/
    └── [id]/
        └── page.tsx           # Deal detail page

components/
├── Navbar.tsx                 # Navigation bar
├── DealCard.tsx               # Deal display component
├── WalletContextProvider.tsx # Wallet connection logic
└── ... more components

lib/
├── api.ts                     # API client
└── solana.ts                  # Solana utility functions
```

### State Management

We use React's built-in state management:

**Context Providers:**
```typescript
// Wallet Context
<WalletContextProvider>
  {/* All components can access wallet state */}
  <App />
</WalletContextProvider>

// Usage in components
const { publicKey, connected, connect } = useWallet();
```

**Local Component State:**
```typescript
// For UI state
const [deals, setDeals] = useState<Deal[]>([]);
const [loading, setLoading] = useState(true);
const [filters, setFilters] = useState<Filters>({});
```

### Wallet Integration

Solana Wallet Adapter provides a unified interface:

```typescript
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

// Auto-detects installed wallets
// Provides connect/disconnect/sign methods
// Handles wallet events
```

**User flow:**
1. User clicks "Connect Wallet"
2. Modal shows available wallets
3. User selects their wallet
4. Wallet extension prompts for approval
5. Connection established
6. Public key available throughout app

### Transaction Handling

```typescript
async function purchaseDeal(dealId: string) {
  try {
    // 1. Prepare transaction
    const tx = await program.methods
      .purchaseDeal()
      .accounts({
        deal: dealPubkey,
        coupon: couponPubkey,
        buyer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
    
    // 2. Sign with wallet
    const signed = await wallet.signTransaction(tx);
    
    // 3. Send to network
    const signature = await connection.sendRawTransaction(
      signed.serialize()
    );
    
    // 4. Confirm
    await connection.confirmTransaction(signature);
    
    // 5. Update UI
    toast.success('Deal purchased successfully!');
    
  } catch (error) {
    toast.error('Purchase failed: ' + error.message);
  }
}
```

## Data Flow

### Complete Purchase Flow

Here's what happens when a user purchases a deal:

```
User clicks "Buy Now"
    │
    ▼
Frontend validates:
  - Wallet connected?
  - Deal still available?
  - User has enough SOL?
    │
    ▼
Call API: POST /api/deals/:id/purchase
    │
    ▼
Backend validates:
  - Deal exists?
  - Deal active and not expired?
  - Supply available?
    │
    ▼
Backend calls smart contract:
  program.methods.purchaseDeal()
    │
    ▼
Smart contract executes:
  1. Check deal conditions
  2. Create coupon account
  3. Transfer SOL (if implemented)
  4. Update deal supply
  5. Emit event
    │
    ▼
Transaction confirmed on Solana
    │
    ▼
Backend receives confirmation:
  - Generate QR code
  - Create response payload
    │
    ▼
API returns to frontend:
  {
    coupon: {...},
    qrCode: "data:image/png...",
    transaction: {...}
  }
    │
    ▼
Frontend updates:
  - Show success message
  - Display coupon
  - Update user's coupon list
  - Refresh deal supply
```

### Deal Creation Flow

```
Merchant fills form
    │
    ▼
Frontend validation:
  - All fields filled?
  - Valid prices?
  - Future expiry date?
    │
    ▼
Call smart contract directly:
  program.methods.createDeal(params)
    │
    ▼
Wallet prompts for signature
    │
    ▼
User approves in wallet
    │
    ▼
Transaction sent to Solana
    │
    ▼
Smart contract creates Deal account
    │
    ▼
Transaction confirmed
    │
    ▼
Frontend receives confirmation:
  - Extract deal address
  - Call API to index deal
  - Redirect to deal page
```

## Security Considerations

### Smart Contract Security

**1. Access Control:**
```rust
// Only deal creator can modify
require!(
    ctx.accounts.authority.key() == deal.authority,
    ErrorCode::Unauthorized
);
```

**2. Input Validation:**
```rust
// Prevent invalid data
require!(
    discounted_price < original_price,
    ErrorCode::InvalidPrice
);

require!(
    discount_percentage <= 100,
    ErrorCode::InvalidDiscount
);
```

**3. Reentrancy Protection:**
Solana's account model prevents classic reentrancy, but we still:
- Check state before modifying
- Use atomic operations
- Verify account ownership

**4. Integer Overflow:**
Rust's default overflow checking prevents this, but we also use:
```rust
// Explicit checked math
deal.current_supply = deal.current_supply
    .checked_add(1)
    .ok_or(ErrorCode::Overflow)?;
```

### API Security

**1. Rate Limiting:**
```typescript
// Prevent abuse
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // max 100 requests per window
}));
```

**2. Input Sanitization:**
```typescript
// Prevent injection attacks
const sanitizedInput = validator.escape(userInput);
```

**3. CORS Configuration:**
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL, // Only allow our frontend
  credentials: true
}));
```

**4. Environment Variables:**
- Never commit `.env` files
- Use different credentials per environment
- Rotate API keys regularly

### Frontend Security

**1. Wallet Security:**
- Never store private keys
- Always verify signatures
- Clear sensitive data on logout

**2. Transaction Verification:**
```typescript
// Always verify before signing
console.log('Transaction details:', tx);
const confirmed = await confirmWithUser(tx);
if (!confirmed) throw new Error('User rejected');
```

**3. XSS Prevention:**
React automatically escapes content, but we also:
- Sanitize user-generated content
- Use Content Security Policy headers
- Validate URLs before rendering

## Design Decisions

### Why Not Use Metaplex for NFTs?

**Decision:** We built custom NFT logic instead of using Metaplex.

**Reasoning:**
1. **Simplicity**: Our coupons don't need all Metaplex features (royalties, collections, etc.)
2. **Cost**: Simpler accounts = lower rent
3. **Control**: Full control over coupon lifecycle
4. **Learning**: Demonstrates understanding of Solana fundamentals

**Trade-off:**
- No automatic marketplace integration
- No standard wallet NFT display
- But: Perfectly tailored to our use case

### Why Express over Next.js API Routes?

**Decision:** Separate Express backend instead of Next.js API routes.

**Reasoning:**
1. **Separation of Concerns**: Clean separation between frontend and backend
2. **Scalability**: Can scale API independently
3. **Flexibility**: Easy to add WebSockets, background jobs, etc.
4. **Deployment**: Can deploy to different services optimized for each
5. **Team Structure**: Different teams can work on each independently

### Why Local State over Redux?

**Decision:** React Context + hooks instead of Redux.

**Reasoning:**
1. **Simplicity**: Less boilerplate, easier to understand
2. **React 19**: Improved Context performance
3. **Scope**: Application complexity doesn't warrant Redux
4. **Bundle Size**: Smaller final bundle

**When we'd use Redux:**
- Larger application with complex state
- Time-travel debugging needed
- Middleware requirements

### Why Mock Data in API?

**Decision:** API returns mock data instead of always querying blockchain.

**Reasoning:**
1. **Performance**: Faster initial development and testing
2. **Reliability**: Not dependent on blockchain availability during demos
3. **Cost**: Reduces RPC calls during development
4. **Flexibility**: Easy to test edge cases

**Production Migration:**
Replace mock data with real blockchain queries:
```typescript
// Development
const deals = mockDeals;

// Production
const deals = await fetchDealsFromBlockchain();
```

## Scalability Considerations

### Current Limitations

**Smart Contracts:**
- Each deal/coupon is a separate account (can get expensive at scale)
- No pagination built into contracts
- Linear search for some operations

**API:**
- In-memory data (no real database)
- No caching layer
- Synchronous external API calls

**Frontend:**
- Client-side rendering for most pages
- No CDN for static assets
- All deal data loaded at once

### Scaling Solutions

**For Production:**

**1. Database Layer:**
```
Solana Blockchain (source of truth)
    │
    ├─► Indexer Service (monitors blockchain)
    │       │
    │       └─► PostgreSQL (indexed data)
    │               │
    │               └─► API (fast queries)
```

**2. Caching:**
```
Redis Cache
    │
    ├─► Deal listings (30s TTL)
    ├─► Merchant profiles (5m TTL)
    ├─► User coupons (1m TTL)
    └─► Analytics (10m TTL)
```

**3. CDN for Static Assets:**
- Host images on CDN (Cloudflare, AWS CloudFront)
- Cache frontend builds
- Serve static data from edge locations

**4. Background Jobs:**
```typescript
// Queue for heavy operations
queue.add('fetch-external-deals', {
  source: 'skyscanner',
  category: 'flights'
});

// Process in background worker
worker.process('fetch-external-deals', async (job) => {
  const deals = await fetchExternalDeals(job.data);
  await cache.set(`external-deals-${job.data.source}`, deals);
});
```

**5. Batch Blockchain Operations:**
```typescript
// Instead of querying each deal individually
const deals = await Promise.all(
  dealIds.map(id => program.account.deal.fetch(id))
);

// Use a single RPC call with multiple accounts
const deals = await connection.getMultipleAccountsInfo(dealIds);
```

### Estimated Capacity

**Current Architecture:**
- ~100 concurrent users
- ~1,000 deals
- ~10,000 coupons
- ~100 requests/second

**With Production Optimizations:**
- ~10,000 concurrent users
- ~1,000,000 deals
- ~10,000,000 coupons
- ~10,000 requests/second

## Conclusion

DealVault's architecture is designed to be:

1. **Simple**: Easy to understand and modify
2. **Modular**: Each layer is independent
3. **Scalable**: Can grow with proper optimizations
4. **Secure**: Multiple layers of validation and protection
5. **Maintainable**: Clean code structure and documentation

The architecture balances hackathon speed with production-ready patterns, making it both a working prototype and a solid foundation for a real product.

For implementation details, see [CODE_STRUCTURE.md](./CODE_STRUCTURE.md).

