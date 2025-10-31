# DealVault API Reference

This document provides detailed information about all API endpoints available in DealVault. Each endpoint is explained with examples, parameters, and expected responses.

## Base URL

```
http://localhost:3001/api  (Development)
https://api.dealvault.io/api  (Production)
```

## Table of Contents

1. [Authentication](#authentication)
2. [Deals Endpoints](#deals-endpoints)
3. [Merchants Endpoints](#merchants-endpoints)
4. [Analytics Endpoints](#analytics-endpoints)
5. [External APIs Endpoints](#external-apis-endpoints)
6. [Error Responses](#error-responses)
7. [Rate Limiting](#rate-limiting)

## Authentication

Currently, the API doesn't require authentication for read operations. Write operations (creating deals, purchases, redemptions) require a Solana wallet signature.

**Future Enhancement:**
```
Authorization: Bearer <jwt_token>
```

## Deals Endpoints

### Get All Deals

Retrieve a list of all available deals with optional filtering and pagination.

**Endpoint:** `GET /api/deals`

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| category | string | No | Filter by category | `Food`, `Travel`, `Health` |
| minDiscount | number | No | Minimum discount percentage | `25` |
| maxPrice | number | No | Maximum discounted price | `100` |
| sortBy | string | No | Sort method | `latest`, `price_low`, `price_high`, `discount`, `expiring` |
| page | number | No | Page number (default: 1) | `1` |
| limit | number | No | Items per page (default: 20) | `20` |

**Example Request:**
```bash
curl "http://localhost:3001/api/deals?category=Food&minDiscount=30&sortBy=discount&limit=10"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "50% Off Premium Coffee",
      "description": "Get half off your favorite premium coffee beans from our local roastery",
      "originalPrice": 40,
      "discountedPrice": 20,
      "discountPercentage": 50,
      "category": "Food",
      "expiryDate": 1730851200000,
      "currentSupply": 25,
      "maxSupply": 100,
      "merchant": {
        "id": "merchant-1",
        "name": "Bean & Brew Coffee Co.",
        "isVerified": true
      },
      "isActive": true,
      "createdAt": 1730419200000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  },
  "filters": {
    "category": "Food",
    "minDiscount": 30,
    "sortBy": "discount"
  }
}
```

---

### Get Deal by ID

Retrieve detailed information about a specific deal.

**Endpoint:** `GET /api/deals/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Deal identifier |

**Example Request:**
```bash
curl "http://localhost:3001/api/deals/1"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "50% Off Premium Coffee",
    "description": "Get half off your favorite premium coffee beans from our local roastery. Enjoy artisanal blends roasted fresh daily.",
    "originalPrice": 40,
    "discountedPrice": 20,
    "discountPercentage": 50,
    "category": "Food",
    "expiryDate": 1730851200000,
    "currentSupply": 25,
    "maxSupply": 100,
    "merchant": {
      "id": "merchant-1",
      "name": "Bean & Brew Coffee Co.",
      "location": "123 Coffee Street, Seattle",
      "isVerified": true,
      "reputationScore": 95
    },
    "isActive": true,
    "createdAt": 1730419200000
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Deal not found"
}
```

---

### Purchase Deal

Purchase a deal and receive an NFT coupon.

**Endpoint:** `POST /api/deals/:id/purchase`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Deal identifier |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| walletAddress | string | Yes | Solana wallet address |
| paymentMethod | string | No | Payment method (default: "SOL") |

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/deals/1/purchase" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "5xJx...",
    "paymentMethod": "SOL"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "coupon": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "dealId": "1",
      "dealTitle": "50% Off Premium Coffee",
      "ownerWallet": "5xJx...",
      "purchasePrice": 20,
      "discountPercentage": 50,
      "isRedeemed": false,
      "purchasedAt": 1730419200000,
      "expiryDate": 1730851200000,
      "merchant": {
        "id": "merchant-1",
        "name": "Bean & Brew Coffee Co.",
        "isVerified": true
      }
    },
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "transaction": {
      "id": "tx-1234567890",
      "amount": 20,
      "currency": "SOL",
      "status": "completed",
      "timestamp": 1730419200000
    }
  },
  "message": "Deal purchased successfully!"
}
```

**Error Responses:**

**400 - Deal Inactive:**
```json
{
  "success": false,
  "error": "Deal is no longer active"
}
```

**400 - Deal Sold Out:**
```json
{
  "success": false,
  "error": "Deal is sold out"
}
```

**400 - Deal Expired:**
```json
{
  "success": false,
  "error": "Deal has expired"
}
```

---

### Redeem Coupon

Redeem a purchased coupon (merchant use).

**Endpoint:** `POST /api/deals/redeem`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| qrData | string | Yes | QR code data (JSON string) |
| merchantWallet | string | Yes | Merchant's wallet address |

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/deals/redeem" \
  -H "Content-Type: application/json" \
  -d '{
    "qrData": "{\"couponId\":\"a1b2...\",\"dealId\":\"1\",\"verificationCode\":\"ABCD1234\"}",
    "merchantWallet": "9zKf..."
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "couponId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "dealId": "1",
    "redeemedAt": 1730505600000,
    "status": "redeemed"
  },
  "message": "Coupon redeemed successfully!"
}
```

**Error Responses:**

**400 - Invalid QR:**
```json
{
  "success": false,
  "error": "Invalid QR code format"
}
```

**400 - Already Redeemed:**
```json
{
  "success": false,
  "error": "Coupon has already been redeemed"
}
```

---

### Get Trending Deals

Get deals sorted by popularity and trending score.

**Endpoint:** `GET /api/deals/trending/popular`

**Example Request:**
```bash
curl "http://localhost:3001/api/deals/trending/popular"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "50% Off Premium Coffee",
      "discountPercentage": 50,
      "currentSupply": 45,
      "maxSupply": 100,
      "trendingScore": 48.0,
      "category": "Food"
    },
    {
      "id": "3",
      "title": "70% Off Gym Membership",
      "discountPercentage": 70,
      "currentSupply": 15,
      "maxSupply": 50,
      "trendingScore": 54.0,
      "category": "Health"
    }
  ]
}
```

## Merchants Endpoints

### Create Merchant Profile

Create a new merchant account on-chain.

**Endpoint:** `POST /api/merchants`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Business name |
| description | string | Yes | Business description |
| website | string | Yes | Business website URL |
| location | string | Yes | Physical location |
| walletAddress | string | Yes | Solana wallet address |

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/merchants" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bean & Brew Coffee Co.",
    "description": "Artisanal coffee roastery",
    "website": "https://beanandbrewcoffee.com",
    "location": "123 Coffee St, Seattle, WA",
    "walletAddress": "9zKf..."
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "merchant-1",
    "authority": "9zKf...",
    "name": "Bean & Brew Coffee Co.",
    "description": "Artisanal coffee roastery",
    "website": "https://beanandbrewcoffee.com",
    "location": "123 Coffee St, Seattle, WA",
    "isVerified": false,
    "totalDeals": 0,
    "totalSales": 0,
    "reputationScore": 0,
    "createdAt": 1730419200000
  },
  "message": "Merchant profile created successfully!"
}
```

---

### Get Merchant by ID

Retrieve merchant profile and statistics.

**Endpoint:** `GET /api/merchants/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Merchant identifier |

**Example Request:**
```bash
curl "http://localhost:3001/api/merchants/merchant-1"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "merchant-1",
      "name": "Bean & Brew Coffee Co.",
      "description": "Artisanal coffee roastery serving Seattle since 2020",
      "website": "https://beanandbrewcoffee.com",
      "location": "123 Coffee St, Seattle, WA",
      "isVerified": true,
      "reputationScore": 95,
      "createdAt": 1700000000000
    },
    "stats": {
      "totalDeals": 12,
      "activeDeals": 8,
      "totalSales": 453,
      "totalRevenue": 12580.50,
      "averageRating": 4.8,
      "totalReviews": 89
    },
    "recentDeals": [
      {
        "id": "1",
        "title": "50% Off Premium Coffee",
        "currentSupply": 45,
        "maxSupply": 100
      }
    ]
  }
}
```

---

### Update Merchant Profile

Update merchant information.

**Endpoint:** `PUT /api/merchants/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Merchant identifier |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| description | string | No | Updated description |
| website | string | No | Updated website |
| location | string | No | Updated location |

**Example Request:**
```bash
curl -X PUT "http://localhost:3001/api/merchants/merchant-1" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Award-winning artisanal coffee roastery",
    "website": "https://beanandbrewcoffee.com"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "merchant-1",
    "name": "Bean & Brew Coffee Co.",
    "description": "Award-winning artisanal coffee roastery",
    "website": "https://beanandbrewcoffee.com",
    "location": "123 Coffee St, Seattle, WA",
    "isVerified": true,
    "updatedAt": 1730419200000
  },
  "message": "Profile updated successfully!"
}
```

## Analytics Endpoints

### Get Deal Analytics

Get detailed analytics for a specific deal.

**Endpoint:** `GET /api/analytics/deals/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Deal identifier |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| period | string | No | Time period (`7d`, `30d`, `90d`, `all`) |

**Example Request:**
```bash
curl "http://localhost:3001/api/analytics/deals/1?period=30d"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "dealId": "1",
    "period": "30d",
    "views": 1250,
    "purchases": 45,
    "redemptions": 38,
    "conversionRate": 3.6,
    "revenue": 900.00,
    "averageRating": 4.7,
    "dailyStats": [
      {
        "date": "2025-10-01",
        "views": 45,
        "purchases": 3,
        "redemptions": 2
      }
    ]
  }
}
```

---

### Get Merchant Analytics

Get analytics for a merchant's performance.

**Endpoint:** `GET /api/analytics/merchants/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Merchant identifier |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| period | string | No | Time period (`7d`, `30d`, `90d`, `all`) |

**Example Request:**
```bash
curl "http://localhost:3001/api/analytics/merchants/merchant-1?period=30d"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "merchantId": "merchant-1",
    "period": "30d",
    "totalRevenue": 12580.50,
    "totalSales": 453,
    "averageOrderValue": 27.77,
    "topDeals": [
      {
        "id": "1",
        "title": "50% Off Premium Coffee",
        "sales": 45,
        "revenue": 900.00
      }
    ],
    "categoryBreakdown": {
      "Food": 320,
      "Beverages": 133
    },
    "growthRate": 15.3
  }
}
```

## External APIs Endpoints

### Get External Deals

Fetch deals aggregated from external sources.

**Endpoint:** `GET /api/external/deals`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter by category |
| source | string | No | Filter by source (`flights`, `hotels`, `shopping`) |
| limit | number | No | Number of results (default: 20) |
| offset | number | No | Pagination offset (default: 0) |

**Example Request:**
```bash
curl "http://localhost:3001/api/external/deals?category=Travel&source=flights&limit=5"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ext-flight-1234",
      "source": "skyscanner",
      "title": "New York to London",
      "description": "Round trip flight for 1 passenger",
      "originalPrice": 850,
      "discountedPrice": 520,
      "discountPercentage": 39,
      "category": "Travel",
      "url": "https://www.skyscanner.com/...",
      "imageUrl": "https://cdn.skyscanner.com/..."
    }
  ],
  "pagination": {
    "limit": 5,
    "offset": 0,
    "total": 156
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific error details"
  }
}
```

### Common HTTP Status Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request (invalid input) |
| 401 | Unauthorized (authentication required) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 429 | Too many requests (rate limited) |
| 500 | Internal server error |
| 503 | Service unavailable |

### Common Error Codes

| Error Code | Description |
|------------|-------------|
| `DEAL_NOT_FOUND` | Deal doesn't exist |
| `DEAL_INACTIVE` | Deal is no longer active |
| `DEAL_EXPIRED` | Deal has passed expiry date |
| `DEAL_SOLD_OUT` | No more coupons available |
| `INVALID_WALLET` | Wallet address is invalid |
| `INSUFFICIENT_FUNDS` | Wallet doesn't have enough SOL |
| `COUPON_REDEEMED` | Coupon already used |
| `INVALID_QR` | QR code data is invalid |
| `MERCHANT_NOT_FOUND` | Merchant doesn't exist |
| `UNAUTHORIZED_ACTION` | User can't perform this action |

## Rate Limiting

The API implements rate limiting to prevent abuse.

**Limits:**
- **Anonymous users**: 60 requests per hour
- **Authenticated users**: 300 requests per hour
- **Merchants**: 600 requests per hour

**Rate Limit Headers:**

Every response includes these headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1730419200
```

**When Rate Limited:**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 3600
}
```

## Webhook Events (Future Feature)

For production use, webhooks will notify your system of important events:

**Event Types:**
- `deal.created`
- `deal.purchased`
- `deal.redeemed`
- `deal.expired`
- `merchant.verified`
- `coupon.transferred`

**Webhook Payload:**
```json
{
  "event": "deal.purchased",
  "timestamp": 1730419200000,
  "data": {
    "dealId": "1",
    "couponId": "a1b2...",
    "buyerWallet": "5xJx...",
    "amount": 20
  }
}
```

## Testing

You can test the API using:

**cURL:**
```bash
curl "http://localhost:3001/api/deals"
```

**Postman:**
Import the collection from `/docs/DealVault-API.postman_collection.json`

**JavaScript:**
```javascript
fetch('http://localhost:3001/api/deals')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Python:**
```python
import requests

response = requests.get('http://localhost:3001/api/deals')
data = response.json()
print(data)
```

## API Client Libraries

We provide official client libraries:

**JavaScript/TypeScript:**
```bash
npm install @dealvault/api-client
```

```typescript
import { DealVaultClient } from '@dealvault/api-client';

const client = new DealVaultClient({
  baseURL: 'http://localhost:3001/api'
});

const deals = await client.deals.list({ category: 'Food' });
```

**Python:**
```bash
pip install dealvault
```

```python
from dealvault import DealVaultClient

client = DealVaultClient(base_url='http://localhost:3001/api')
deals = client.deals.list(category='Food')
```

## Support

For API support:
- GitHub Issues: [github.com/dealvault/issues](https://github.com/dealvault/issues)
- Documentation: [docs.dealvault.io](https://docs.dealvault.io)
- Discord: [discord.gg/dealvault](https://discord.gg/dealvault)

## Changelog

### v1.0.0 (2025-10-31)
- Initial API release
- Core endpoints for deals, merchants, analytics
- External API integration
- QR code generation for redemption

---

**Last Updated:** October 31, 2025  
**API Version:** 1.0.0  
**Status:** Active Development

