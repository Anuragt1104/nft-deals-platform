# DealVault - NFT-Powered Deal Discovery Platform

## What is DealVault?

Think of DealVault as the Web3 version of Groupon, but with a revolutionary twist. Instead of getting a traditional coupon that expires worthlessly, every deal you purchase becomes a real digital asset - an NFT on the Solana blockchain that you actually own. This means you can trade it, sell it, or gift it to someone else before it expires. It's like turning every discount into a collectible that has real value.

## The Problem We Solve

Traditional discount platforms like Groupon have several major problems:

- **No Real Ownership**: When you buy a coupon, you don't really own it. It's just data in their database that they control.
- **Can't Transfer or Sell**: Bought something you can't use? Too bad. Traditional coupons are locked to your account.
- **No Secondary Market**: If you can't use a deal before it expires, your money is just gone.
- **Lack of Transparency**: You never really know how many deals are left or how popular they are.
- **Centralized Control**: The platform controls everything about your coupons.

DealVault fixes all of this by putting deals on the blockchain as NFTs. This means:

- You truly own your discount coupons
- You can sell unused coupons to other people
- Everything is transparent and verifiable on-chain
- Merchants maintain control but users have freedom
- A liquid secondary market creates real value

## How It Works

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Merchant  │ creates │   Deal NFT   │ bought  │    User     │
│  Dashboard  │────────▶│  on Solana   │◀────────│  Browses &  │
│             │         │  Blockchain  │         │  Purchases  │
└─────────────┘         └──────────────┘         └─────────────┘
                               │                         │
                               │                         │
                               ▼                         ▼
                        ┌──────────────┐         ┌─────────────┐
                        │   Coupon     │  scan   │  Secondary  │
                        │  Redemption  │◀────────│  Resale     │
                        │   (QR Code)  │         │  Market     │
                        └──────────────┘         └─────────────┘
```

### For Users

1. **Browse Deals**: Explore deals from verified merchants across categories like food, travel, shopping, and entertainment
2. **Purchase with Crypto**: Buy deals using your Solana wallet - each purchase mints a unique NFT coupon
3. **Own Your Discount**: Your coupon is an NFT in your wallet that you truly own
4. **Use or Trade**: Either redeem the coupon at the merchant or sell it on the marketplace if you can't use it
5. **Earn from Resale**: Recover value by selling unused coupons before they expire

### For Merchants

1. **Create Profile**: Set up your verified merchant account on-chain
2. **Design Promotions**: Create deals with custom discount percentages, prices, and expiry dates
3. **Mint Deal NFTs**: Your deals automatically become NFT coupons when users purchase them
4. **Track Everything**: See real-time analytics on sales, redemptions, and performance
5. **Verify Redemptions**: Scan QR codes to redeem coupons securely on-chain

## Key Features

### NFT Coupons
Every deal is minted as a unique, transferable NFT on Solana. This means you can:
- Prove ownership cryptographically
- Transfer to anyone else
- Trade on secondary markets
- View complete transaction history

### Social Discovery Layer
Find the best deals through community engagement:
- Rate and review deals you've used
- Share great finds with friends
- See what's trending in your area
- Comment and discuss with other users

### Verified Merchants
All merchants go through verification to ensure authenticity:
- On-chain merchant profiles
- Reputation scoring system
- Transaction history visible to all
- Community feedback and ratings

### Secondary Marketplace
Create a liquid market for unused coupons:
- List your coupons for resale
- Browse deals from other users
- Price discovery based on time left and demand
- Recover value from unused purchases

### Secure Redemption
Redemption is tracked on-chain with QR code verification:
- Generate unique QR codes for each coupon
- Merchants scan to verify authenticity
- Single-use enforcement via smart contract
- Instant on-chain confirmation

### External Deal Aggregation
We don't just rely on merchant uploads - we aggregate from major platforms:
- Integration with travel APIs (flights, hotels)
- Shopping deal feeds
- Restaurant and entertainment offers
- Real-time price updates

## Technology Stack

DealVault is built with modern Web3 and Web2 technologies to provide the best experience:

### Blockchain Layer
- **Solana**: Fast, low-cost blockchain perfect for NFT transactions
- **Anchor Framework**: Rust-based framework for secure smart contracts
- **SPL Token Standard**: For creating and managing NFT coupons

### Backend API
- **Node.js + Express**: RESTful API server
- **TypeScript**: Type-safe backend development
- **External API Integration**: Connects to travel, shopping, and deal APIs

### Frontend
- **Next.js 16**: Modern React framework with server-side rendering
- **TypeScript**: Type-safe frontend development
- **Tailwind CSS**: Utility-first styling for beautiful UI
- **Solana Wallet Adapter**: Seamless wallet integration

### Web3 Integration
- **Phantom & Solflare**: Leading Solana wallet support
- **@solana/web3.js**: JavaScript SDK for Solana
- **@coral-xyz/anchor**: TypeScript SDK for our smart contracts

## Project Status

This project was built for the MonkeDAO track at the Cypherpunk hackathon. We've implemented:

✅ Core smart contracts for deal creation, purchase, and redemption  
✅ NFT-based coupon system with ownership tracking  
✅ Merchant dashboard for creating and managing deals  
✅ User marketplace for discovering and purchasing deals  
✅ External API integration for deal aggregation  
✅ QR code generation and redemption flow  
✅ Wallet integration with Phantom and Solflare  
✅ Social features (ratings, comments, sharing)  

## Quick Start

Want to run DealVault locally? Here's what you need:

### Prerequisites
- Node.js 18+ and npm
- Rust and Cargo (for smart contracts)
- Solana CLI tools
- Anchor Framework
- A Solana wallet (Phantom recommended)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd nft-deals-platform
```

2. **Install dependencies**
```bash
# Install smart contract dependencies
cd smart-contracts
npm install

# Install API dependencies
cd ../api
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Set up Solana local validator**
```bash
# Start a local Solana test validator
solana-test-validator
```

4. **Deploy smart contracts**
```bash
cd smart-contracts
anchor build
anchor deploy
```

5. **Configure environment variables**
```bash
# In the api directory
cp .env.example .env
# Edit .env with your configuration

# In the frontend directory
cp .env.example .env.local
# Edit .env.local with your configuration
```

6. **Start the development servers**
```bash
# Terminal 1: Start API server
cd api
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

7. **Open your browser**
Navigate to `http://localhost:3000` and connect your Solana wallet!

For detailed setup instructions, see [SETUP.md](./SETUP.md).

## Repository Structure

```
nft-deals-platform/
├── smart-contracts/      # Solana smart contracts (Anchor/Rust)
│   ├── programs/        # Smart contract source code
│   ├── tests/           # Contract tests
│   └── target/          # Build artifacts
│
├── api/                 # Backend REST API (Node.js + Express)
│   ├── src/
│   │   ├── routes/     # API endpoints
│   │   ├── services/   # Business logic
│   │   └── utils/      # Helper functions
│   └── dist/           # Compiled JavaScript
│
├── frontend/            # Next.js web application
│   ├── src/
│   │   ├── app/        # Next.js pages and routes
│   │   ├── components/ # React components
│   │   └── lib/        # Utility libraries
│   └── public/         # Static assets
│
├── docs/               # Additional documentation
├── scripts/            # Deployment and utility scripts
└── deployment/         # Deployment configurations
```

For detailed code explanations, see [CODE_STRUCTURE.md](./CODE_STRUCTURE.md).

## Architecture

DealVault follows a three-tier architecture:

1. **Smart Contract Layer**: Handles all blockchain operations (deal creation, purchases, redemptions)
2. **API Layer**: Provides REST endpoints, integrates external APIs, handles business logic
3. **Frontend Layer**: User interface for both users and merchants

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Smart Contracts

Our smart contracts are written in Rust using the Anchor framework. They handle:

- **Deal Creation**: Merchants create deals with pricing, supply limits, and expiry dates
- **Coupon Purchase**: Users buy deals and receive NFT coupons
- **Redemption**: Merchants verify and redeem coupons on-chain
- **Merchant Profiles**: On-chain merchant verification and reputation

The contracts enforce business rules like:
- Deals can't be purchased after expiry
- Coupons can only be redeemed once
- Supply limits are enforced automatically
- Ownership is tracked cryptographically

## Contributing

This is a hackathon project, but we welcome contributions! If you'd like to improve DealVault:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Future Roadmap

While built for a hackathon, here's where DealVault could go next:

- **Loyalty NFTs**: Special badge NFTs for active users with exclusive perks
- **Staking Rewards**: Stake your coupon NFTs for merchant tokens
- **Geo-Location**: "Deals near me" with location-based discovery
- **Group Deals**: Pool resources with friends to unlock tiered discounts
- **Cross-Chain**: Expand beyond Solana to other chains
- **Mobile App**: Native iOS and Android applications
- **Merchant API**: Allow businesses to integrate directly
- **DAO Governance**: Community-driven platform decisions

## License

This project is licensed under the ISC License.

## Hackathon Submission

**Track**: MonkeDAO - Next Evolution of Groupon  
**Team**: DealVault  
**Event**: Cypherpunk Hackathon

### Submission Components

- ✅ Deployed application (see SETUP.md for deployment instructions)
- ✅ GitHub repository with complete source code
- ✅ Video demonstration (see demo video link)
- ✅ Technical documentation (this README and associated docs)
- ✅ API exposed for integration

## Support

For questions, issues, or feedback:

- Open an issue on GitHub
- Contact the team (contact info)
- Check the documentation in `/docs`

## Acknowledgments

Built with support from:
- MonkeDAO for sponsoring this track
- Solana Foundation for excellent developer tools
- The Anchor Framework team
- The vibrant Solana developer community

---

**Ready to turn discounts into digital assets? Let's revolutionize deal discovery together.**

