# DealVault API

Backend API server for the Web3 Deal Discovery & NFT Coupon Platform.

## Features

- **Deal Management**: CRUD operations for deal listings
- **External API Aggregation**: Fetches deals from multiple sources (flights, hotels, shopping, restaurants, activities)
- **Coupon Generation**: Creates QR codes for NFT coupons
- **Merchant Analytics**: Tracks merchant performance and sales
- **Platform Analytics**: Overall platform statistics and insights

## API Endpoints

### Deals
- `GET /api/deals` - Get all deals with filtering and pagination
- `GET /api/deals/:id` - Get specific deal details
- `POST /api/deals/:id/purchase` - Purchase a deal (creates NFT coupon)
- `POST /api/deals/redeem` - Redeem a coupon using QR code
- `GET /api/deals/trending/popular` - Get trending deals

### External APIs
- `GET /api/external/deals` - Get aggregated deals from all sources
- `GET /api/external/flights` - Get flight deals
- `GET /api/external/hotels` - Get hotel deals
- `GET /api/external/shopping` - Get shopping deals
- `GET /api/external/restaurants` - Get restaurant deals

### Merchants
- `GET /api/merchants/:walletAddress` - Get merchant profile

### Analytics
- `GET /api/analytics/platform` - Get platform analytics
- `GET /api/analytics/merchant/:walletAddress` - Get merchant analytics

### Health Check
- `GET /health` - API health status

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build project
npm run build

# Start production server
npm start
```

## Environment Variables

Create a `.env` file with:

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
JWT_SECRET=your_jwt_secret_here
```

## Technologies

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **QRCode** - QR code generation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging
- **Axios** - HTTP client for external APIs

## External API Integration

The API includes mock implementations for various deal sources. In production, these would connect to real APIs:

- **Flights**: Skyscanner, Kayak, Expedia
- **Hotels**: Booking.com, Hotels.com, Expedia
- **Shopping**: Amazon, eBay, retail partners
- **Restaurants**: OpenTable, Yelp, delivery platforms
- **Activities**: GetYourGuide, Viator, local event platforms

## Testing

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test deals endpoint
curl http://localhost:3001/api/deals

# Test external deals
curl http://localhost:3001/api/external/deals
```

## Production Deployment

For production deployment:

1. Set up real database (PostgreSQL/MongoDB)
2. Configure real external API keys
3. Set up authentication middleware
4. Add rate limiting
5. Set up monitoring and logging
6. Configure SSL/TLS
7. Set up Docker container or deploy to cloud platform