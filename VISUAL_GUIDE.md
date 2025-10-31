# DealVault Visual Guide

This document provides visual representations of how DealVault works, including user flows, system architecture, and data relationships. All diagrams are presented in ASCII art for clarity.

## Table of Contents

1. [System Architecture Diagram](#system-architecture-diagram)
2. [User Purchase Flow](#user-purchase-flow)
3. [Merchant Deal Creation Flow](#merchant-deal-creation-flow)
4. [Coupon Redemption Flow](#coupon-redemption-flow)
5. [Data Relationships](#data-relationships)
6. [Smart Contract Interactions](#smart-contract-interactions)
7. [Technology Stack Layers](#technology-stack-layers)

## System Architecture Diagram

This shows how all the components of DealVault connect and communicate with each other.

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                             │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Homepage   │  │ Marketplace  │  │   Merchant   │              │
│  │              │  │   (Browse)   │  │  Dashboard   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                  │                  │                      │
│         └──────────────────┴──────────────────┘                      │
│                            │                                         │
│                    ┌───────▼────────┐                               │
│                    │  Wallet Adapter │                               │
│                    │ (Phantom/Sol.)  │                               │
│                    └───────┬────────┘                               │
└────────────────────────────┼─────────────────────────────────────────┘
                             │
                             │ HTTPS/REST
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                         BACKEND API LAYER                            │
│                                                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │   Deals    │  │ Merchants  │  │ Analytics  │  │  External  │   │
│  │  Routes    │  │  Routes    │  │  Routes    │  │API Routes  │   │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘   │
│        │               │               │               │            │
│  ┌─────▼───────────────▼───────────────▼───────────────▼──────┐   │
│  │              Business Logic Services                        │   │
│  │  • Deal Management   • QR Generation                        │   │
│  │  • User Validation   • External API Integration             │   │
│  └────────────────────┬────────────────────────────────────────┘   │
└────────────────────────┼─────────────────────────────────────────────┘
                         │
                         │ JSON-RPC
                         │
┌────────────────────────▼─────────────────────────────────────────────┐
│                    SMART CONTRACT LAYER                              │
│                      (Solana Blockchain)                             │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    DealVault Program                          │   │
│  │                                                               │   │
│  │  Instructions:                    Accounts:                  │   │
│  │  • create_deal()                 • Deal                      │   │
│  │  • purchase_deal()               • Coupon                    │   │
│  │  • redeem_coupon()               • Merchant                  │   │
│  │  • create_merchant_profile()                                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Solana Blockchain                          │   │
│  │  • Transaction Processing  • Account Storage                 │   │
│  │  • Consensus Mechanism     • Immutable Ledger                │   │
│  └──────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────┘
```

## User Purchase Flow

This diagram shows what happens when a user purchases a deal, from clicking "Buy" to receiving their NFT coupon.

```
USER                    FRONTEND                  API                 BLOCKCHAIN
 │                         │                       │                       │
 │  1. Browse Deals        │                       │                       │
 ├────────────────────────▶│                       │                       │
 │                         │  2. Load Deals        │                       │
 │                         ├──────────────────────▶│                       │
 │                         │                       │  3. Fetch on-chain   │
 │                         │                       │     deal data         │
 │                         │                       ├──────────────────────▶│
 │                         │                       │◀──────────────────────┤
 │                         │◀──────────────────────┤                       │
 │                         │  4. Display Deals     │                       │
 │◀────────────────────────┤                       │                       │
 │                         │                       │                       │
 │  5. Click "Buy Now"     │                       │                       │
 ├────────────────────────▶│                       │                       │
 │                         │  6. Check wallet      │                       │
 │                         │     connected?        │                       │
 │                         │                       │                       │
 │  7. Connect Wallet      │                       │                       │
 │  (if needed)            │                       │                       │
 ├────────────────────────▶│                       │                       │
 │◀────────────────────────┤                       │                       │
 │  Wallet connected ✓     │                       │                       │
 │                         │                       │                       │
 │  8. Confirm Purchase    │                       │                       │
 ├────────────────────────▶│                       │                       │
 │                         │  9. Send purchase     │                       │
 │                         │     request           │                       │
 │                         ├──────────────────────▶│                       │
 │                         │                       │ 10. Validate deal     │
 │                         │                       │     (active, supply,  │
 │                         │                       │      expiry)          │
 │                         │                       │                       │
 │                         │                       │ 11. Call smart        │
 │                         │                       │     contract          │
 │                         │                       │   purchase_deal()     │
 │                         │                       ├──────────────────────▶│
 │                         │                       │                       │
 │                         │                       │  12. Create Coupon   │
 │                         │                       │      account          │
 │                         │                       │      (NFT mint)       │
 │                         │                       │                       │
 │                         │                       │  13. Update deal     │
 │                         │                       │      supply          │
 │                         │                       │                       │
 │                         │                       │◀──────────────────────┤
 │                         │                       │  Transaction Success  │
 │                         │                       │                       │
 │                         │                       │ 14. Generate QR code  │
 │                         │                       │     for redemption    │
 │                         │                       │                       │
 │                         │  15. Return coupon    │                       │
 │                         │      + QR code        │                       │
 │                         │◀──────────────────────┤                       │
 │                         │                       │                       │
 │  16. Display Success    │                       │                       │
 │  • Show coupon details  │                       │                       │
 │  • Display QR code      │                       │                       │
 │  • Save to wallet       │                       │                       │
 │◀────────────────────────┤                       │                       │
 │                         │                       │                       │
```

**Key Steps Explained:**

1-4: User browses available deals loaded from the blockchain  
5-7: User initiates purchase and connects wallet if needed  
8-10: Purchase request is validated by the API  
11-13: Smart contract executes purchase and mints NFT coupon  
14-16: QR code is generated and displayed to user  

## Merchant Deal Creation Flow

This shows how merchants create new deals on the platform.

```
MERCHANT               FRONTEND                  BLOCKCHAIN
  │                       │                           │
  │  1. Go to Merchant    │                           │
  │     Dashboard         │                           │
  ├──────────────────────▶│                           │
  │                       │                           │
  │  2. Fill Deal Form    │                           │
  │  • Title              │                           │
  │  • Description        │                           │
  │  • Prices             │                           │
  │  • Discount %         │                           │
  │  • Category           │                           │
  │  • Expiry date        │                           │
  │  • Max supply         │                           │
  ├──────────────────────▶│                           │
  │                       │                           │
  │  3. Click "Create     │                           │
  │     Deal"             │                           │
  ├──────────────────────▶│                           │
  │                       │                           │
  │                       │  4. Validate input        │
  │                       │  • Required fields?       │
  │                       │  • Valid prices?          │
  │                       │  • Future date?           │
  │                       │                           │
  │                       │  5. Build transaction     │
  │                       │     to smart contract     │
  │                       │                           │
  │  6. Wallet prompt     │                           │
  │  "Approve transaction"│                           │
  │◀──────────────────────┤                           │
  │                       │                           │
  │  7. User approves     │                           │
  ├──────────────────────▶│                           │
  │                       │                           │
  │                       │  8. Send transaction      │
  │                       │     create_deal()         │
  │                       ├──────────────────────────▶│
  │                       │                           │
  │                       │  9. Create Deal account   │
  │                       │     on blockchain         │
  │                       │                           │
  │                       │  10. Store all deal data  │
  │                       │      • Merchant authority │
  │                       │      • Deal details       │
  │                       │      • Pricing info       │
  │                       │      • Supply limits      │
  │                       │                           │
  │                       │◀──────────────────────────┤
  │                       │  Transaction confirmed    │
  │                       │                           │
  │  11. Success!         │                           │
  │  • Deal ID            │                           │
  │  • View deal page     │                           │
  │  • Share link         │                           │
  │◀──────────────────────┤                           │
  │                       │                           │
```

## Coupon Redemption Flow

This shows how merchants redeem coupons at their physical location.

```
USER              MERCHANT            FRONTEND              BLOCKCHAIN
 │                   │                   │                      │
 │  1. Show QR code  │                   │                      │
 │   (on phone)      │                   │                      │
 ├──────────────────▶│                   │                      │
 │                   │                   │                      │
 │                   │  2. Scan QR code  │                      │
 │                   │     with phone    │                      │
 │                   ├──────────────────▶│                      │
 │                   │                   │                      │
 │                   │                   │  3. Parse QR data   │
 │                   │                   │     Extract:         │
 │                   │                   │     • Coupon ID      │
 │                   │                   │     • Deal ID        │
 │                   │                   │     • Verification   │
 │                   │                   │       code           │
 │                   │                   │                      │
 │                   │                   │  4. Call smart       │
 │                   │                   │     contract         │
 │                   │                   │   redeem_coupon()    │
 │                   │                   ├─────────────────────▶│
 │                   │                   │                      │
 │                   │                   │  5. Verify coupon:   │
 │                   │                   │     • Valid code?    │
 │                   │                   │     • Not redeemed?  │
 │                   │                   │     • Not expired?   │
 │                   │                   │     • Right merchant?│
 │                   │                   │                      │
 │                   │                   │  6. Mark as redeemed │
 │                   │                   │     is_redeemed=true │
 │                   │                   │     redemption_date= │
 │                   │                   │     current_time     │
 │                   │                   │                      │
 │                   │                   │◀─────────────────────┤
 │                   │                   │  Redemption success  │
 │                   │                   │                      │
 │                   │  7. Show success  │                      │
 │                   │◀──────────────────┤                      │
 │  8. Enjoy deal!   │                   │                      │
 │  (get discount)   │                   │                      │
 │◀──────────────────┤                   │                      │
 │                   │                   │                      │
```

**Security Notes:**
- QR code contains verification code for extra security
- Smart contract enforces single-use (cannot redeem twice)
- Only valid merchant can redeem their own deals
- Expiry date is checked on-chain

## Data Relationships

This shows how different data entities relate to each other.

```
┌─────────────────────────────────────────────────────────────────┐
│                         MERCHANT                                │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  • Wallet Address (authority)                          │    │
│  │  • Name                                                 │    │
│  │  • Description                                          │    │
│  │  • Website                                              │    │
│  │  • Location                                             │    │
│  │  • Is Verified                                          │    │
│  │  • Reputation Score                                     │    │
│  │  • Total Deals Created                                  │    │
│  │  • Total Sales                                          │    │
│  └────────────────────────────────────────────────────────┘    │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ creates (1-to-many)
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                           DEAL                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  • Deal ID                                              │    │
│  │  • Merchant (authority)            ─────┐               │    │
│  │  • Title                                 │               │    │
│  │  • Description                           │ references   │    │
│  │  • Original Price                        │ merchant     │    │
│  │  • Discounted Price                      │               │    │
│  │  • Discount Percentage              ─────┘               │    │
│  │  • Category                                              │    │
│  │  • Expiry Date                                           │    │
│  │  • Max Supply                                            │    │
│  │  • Current Supply                                        │    │
│  │  • Is Active                                             │    │
│  │  • Created At                                            │    │
│  └────────────────────────────────────────────────────────┘    │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ purchased_as (1-to-many)
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         COUPON (NFT)                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  • Coupon ID                                            │    │
│  │  • Deal ID                        ─────┐                │    │
│  │  • Owner (wallet address)              │ references    │    │
│  │  • Is Redeemed                         │ deal          │    │
│  │  • Purchase Date                  ─────┘                │    │
│  │  • Redemption Date (optional)                           │    │
│  │  • Redemption Code                                      │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

RELATIONSHIP SUMMARY:
• One MERCHANT can create many DEALS
• One DEAL can be purchased as many COUPONS (up to max supply)
• Each COUPON is owned by one USER (wallet)
• Each COUPON references one DEAL
• Each DEAL references one MERCHANT
```

## Smart Contract Interactions

This shows the flow of data through smart contract functions.

```
CREATE DEAL FLOW:
═════════════════

Input Parameters:
┌──────────────────┐
│  • title         │
│  • description   │
│  • original $    │
│  • discounted $  │──▶  create_deal()  ──▶  New Deal Account Created
│  • discount %    │                          on Solana Blockchain
│  • category      │
│  • expiry date   │                     ┌───────────────────────┐
│  • max supply    │                     │  Deal {               │
└──────────────────┘                     │    authority: <key>   │
                                         │    title: "..."       │
Signer:                                  │    original_price: X  │
┌──────────────────┐                     │    ...                │
│  Merchant Wallet │──▶ (signs tx) ──▶   │    current_supply: 0  │
└──────────────────┘                     │    is_active: true    │
                                         │  }                    │
                                         └───────────────────────┘


PURCHASE DEAL FLOW:
═══════════════════

Input:
┌──────────────────┐
│  Deal Account    │──▶  purchase_deal()
└──────────────────┘          │
                              │
Validations:                  ▼
┌──────────────────────────────────────┐
│  ✓ Deal is active?                   │
│  ✓ Supply available?                 │──▶  Pass? ──▶  Execute
│  ✓ Not expired?                      │
└──────────────────────────────────────┘

Creates:
┌───────────────────────┐       Updates:
│  New Coupon Account   │       ┌─────────────────────────┐
│  {                    │       │  Deal.current_supply++  │
│    deal_id: <key>     │       └─────────────────────────┘
│    owner: <buyer>     │
│    is_redeemed: false │
│    redemption_code    │
│  }                    │
└───────────────────────┘


REDEEM COUPON FLOW:
═══════════════════

Input:
┌──────────────────┐
│  Coupon Account  │
│  Redemption Code │──▶  redeem_coupon(code)
│  Merchant Wallet │              │
└──────────────────┘              │
                                  ▼
Validations:
┌──────────────────────────────────────┐
│  ✓ Code matches?                     │
│  ✓ Not already redeemed?             │──▶  Pass? ──▶  Execute
│  ✓ Not expired?                      │
│  ✓ Merchant is authorized?           │
└──────────────────────────────────────┘

Updates:
┌───────────────────────────────┐
│  Coupon {                     │
│    is_redeemed: true          │
│    redemption_date: now       │
│  }                            │
└───────────────────────────────┘
```

## Technology Stack Layers

This shows all the technologies used at each layer.

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│                                                                 │
│  Next.js 16        │  React 19        │  TypeScript 5          │
│  Tailwind CSS 4    │  Lucide Icons    │  React Hooks           │
│─────────────────────────────────────────────────────────────────│
│  @solana/wallet-adapter-react      │  Phantom Integration     │
│  @solana/wallet-adapter-react-ui   │  Solflare Integration    │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│                                                                 │
│  Node.js 18+       │  Express 5       │  TypeScript 5          │
│  Axios             │  Morgan Logger   │  Helmet Security       │
│  CORS              │  dotenv Config   │  QRCode Generation     │
│─────────────────────────────────────────────────────────────────│
│  External API Integration:                                      │
│  • Travel APIs     • Shopping APIs    • Restaurant APIs        │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ JSON-RPC
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BLOCKCHAIN LAYER                              │
│                                                                 │
│  Anchor 0.32.1     │  Rust 1.70+      │  Solana Web3.js       │
│  Borsh Serialization│  SPL Token       │  Solana CLI           │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SOLANA BLOCKCHAIN                             │
│                                                                 │
│  • Proof of History Consensus                                   │
│  • 400ms Block Time                                             │
│  • ~$0.00025 per Transaction                                    │
│  • Account-based Data Model                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Development Environment

```
LOCAL DEVELOPMENT SETUP:

┌────────────────────────────────────────────────────────────────┐
│                    DEVELOPER MACHINE                           │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Terminal 1: solana-test-validator                    │    │
│  │  ├─ Local Solana blockchain                           │    │
│  │  ├─ Port: 8899 (RPC)                                  │    │
│  │  └─ Port: 8900 (WebSocket)                            │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Terminal 2: Backend API (npm run dev)                │    │
│  │  ├─ Express server                                    │    │
│  │  ├─ Port: 3001                                        │    │
│  │  ├─ Hot reload with nodemon                           │    │
│  │  └─ Connects to localhost:8899                        │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Terminal 3: Frontend (npm run dev)                   │    │
│  │  ├─ Next.js dev server                                │    │
│  │  ├─ Port: 3000                                        │    │
│  │  ├─ Hot reload enabled                                │    │
│  │  └─ Connects to localhost:3001 (API)                  │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  Browser: http://localhost:3000                               │
│           + Phantom/Solflare Wallet Extension                 │
└────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
PRODUCTION DEPLOYMENT:

┌────────────────────────────────────────────────────────────────┐
│                         FRONTEND                               │
│                    (Vercel/Netlify)                            │
│  • Next.js static + SSR                                        │
│  • CDN: Global edge network                                    │
│  • Domain: https://dealvault.io                                │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     │ HTTPS
                     ▼
┌────────────────────────────────────────────────────────────────┐
│                       BACKEND API                              │
│                   (Railway/Render)                             │
│  • Node.js Express server                                      │
│  • Load balancer                                               │
│  • Domain: https://api.dealvault.io                            │
│  • Redis cache (optional)                                      │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     │ RPC
                     ▼
┌────────────────────────────────────────────────────────────────┐
│                   SOLANA BLOCKCHAIN                            │
│                                                                │
│  • Devnet: https://api.devnet.solana.com                      │
│  • Mainnet: https://api.mainnet-beta.solana.com               │
│  • Smart contracts deployed                                    │
│  • Program ID: [deployed address]                              │
└────────────────────────────────────────────────────────────────┘
```

## Summary

These visual diagrams provide a complete picture of how DealVault works:

**Architecture**: Three-layer system (Frontend → API → Blockchain)  
**User Flow**: Browse → Purchase → Receive NFT → Redeem  
**Merchant Flow**: Create profile → Create deals → Verify redemptions  
**Data Model**: Merchants create Deals, Users purchase Coupons  
**Tech Stack**: Modern Web3 technologies on Solana  

For more details:
- Code walkthrough: [CODE_STRUCTURE.md](./CODE_STRUCTURE.md)
- Architecture deep dive: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Setup instructions: [SETUP.md](./SETUP.md)
- API reference: [API_REFERENCE.md](./API_REFERENCE.md)

---

**Created for:** MonkeDAO Track - Cypherpunk Hackathon  
**Project:** DealVault - NFT-Powered Deal Discovery Platform  
**Last Updated:** October 31, 2025

