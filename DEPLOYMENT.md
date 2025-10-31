# DealVault Deployment Guide

This guide walks you through deploying DealVault to production environments. We'll cover deploying the smart contracts to Solana devnet/mainnet, the API to a cloud service, and the frontend to a hosting platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Smart Contract Deployment](#smart-contract-deployment)
3. [Backend API Deployment](#backend-api-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment Checklist](#post-deployment-checklist)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

### Required Accounts
- Solana wallet with sufficient SOL for deployment
- GitHub account for code hosting
- Vercel/Netlify account for frontend hosting
- Railway/Render account for backend hosting
- Domain name (optional but recommended)

### Required Tools
- Solana CLI tools installed
- Anchor Framework installed
- Node.js 18+ installed
- Git installed

### Required Information
- RPC endpoint URLs (for devnet or mainnet)
- API keys for external services
- Wallet keypair file location

## Smart Contract Deployment

### Step 1: Choose Your Network

**Devnet (Recommended for Testing):**
- Free SOL from faucet
- Faster iteration
- No financial risk
- URL: `https://api.devnet.solana.com`

**Mainnet (Production):**
- Requires real SOL
- Real transactions
- Live users
- URL: `https://api.mainnet-beta.solana.com`

### Step 2: Configure Solana CLI

```bash
# Switch to devnet
solana config set --url devnet

# OR switch to mainnet
solana config set --url mainnet-beta

# Set your keypair
solana config set --keypair ~/.config/solana/id.json

# Check your balance
solana balance
```

### Step 3: Get SOL for Deployment

**Devnet:**
```bash
# Request airdrop (may need to run multiple times)
solana airdrop 2
solana airdrop 2
```

**Mainnet:**
- Purchase SOL from an exchange
- Transfer to your deployment wallet
- Ensure you have at least 5 SOL for deployment and testing

### Step 4: Build and Deploy Smart Contracts

```bash
cd smart-contracts

# Clean previous builds
anchor clean

# Build the program
anchor build

# Deploy to configured network
anchor deploy

# IMPORTANT: Save the Program ID that's displayed!
# It will look like: Program Id: 2TfqdC8KVcDgEeN5EEF1GpFnmWTGr7woUiRnPNMoMoLC
```

### Step 5: Verify Deployment

```bash
# Check program account
solana program show <PROGRAM_ID>

# You should see:
# Program Id: <your-program-id>
# Owner: BPFLoaderUpgradeab1e11111111111111111111111
# Data Length: <size>
```

### Step 6: Update Configuration

After deployment, update these files with your new Program ID:

**smart-contracts/Anchor.toml:**
```toml
[programs.devnet]  # or [programs.mainnet]
smart_contracts = "<YOUR_PROGRAM_ID>"
```

**frontend/.env.local:**
```env
NEXT_PUBLIC_PROGRAM_ID=<YOUR_PROGRAM_ID>
```

**api/.env:**
```env
PROGRAM_ID=<YOUR_PROGRAM_ID>
```

### Step 7: Run Tests on Deployed Program

```bash
# Update test file with new Program ID
cd smart-contracts

# Run tests against deployed program
anchor test --skip-build --skip-deploy
```

## Backend API Deployment

We'll use Railway for this example, but similar steps apply to Render, Heroku, or AWS.

### Option 1: Deploy to Railway

#### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

#### 2. Login to Railway

```bash
railway login
```

#### 3. Initialize Project

```bash
cd api
railway init
```

#### 4. Set Environment Variables

```bash
# Set each variable
railway variables set PORT=3001
railway variables set NODE_ENV=production
railway variables set SOLANA_NETWORK=https://api.devnet.solana.com
railway variables set PROGRAM_ID=<YOUR_PROGRAM_ID>
railway variables set FRONTEND_URL=https://your-frontend-domain.com

# Optional: External API keys
railway variables set SKYSCANNER_API_KEY=your_key
railway variables set BOOKING_API_KEY=your_key
```

#### 5. Deploy

```bash
railway up
```

Your API will be deployed and you'll get a URL like:
`https://your-api.up.railway.app`

#### 6. Test Deployment

```bash
curl https://your-api.up.railway.app/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-10-31T...",
  "version": "1.0.0",
  "service": "DealVault API"
}
```

### Option 2: Deploy to Render

#### 1. Create Account

Sign up at [render.com](https://render.com)

#### 2. Create New Web Service

- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select the `api` directory

#### 3. Configure Service

**Settings:**
- Name: `dealvault-api`
- Environment: `Node`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Instance Type: `Free` (or `Starter` for production)

**Environment Variables:**
```
PORT=3001
NODE_ENV=production
SOLANA_NETWORK=https://api.devnet.solana.com
PROGRAM_ID=<YOUR_PROGRAM_ID>
FRONTEND_URL=https://your-frontend-domain.com
```

#### 4. Deploy

Click "Create Web Service" and wait for deployment to complete.

### Custom Domain for API (Optional)

#### Railway:
```bash
railway domain
```

#### Render:
- Go to Settings → Custom Domain
- Add your domain: `api.yoursite.com`
- Update DNS with provided CNAME

## Frontend Deployment

We'll use Vercel (recommended for Next.js), but Netlify works similarly.

### Option 1: Deploy to Vercel

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login

```bash
vercel login
```

#### 3. Deploy from Frontend Directory

```bash
cd frontend

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

#### 4. Set Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these:
```
NEXT_PUBLIC_API_URL=https://your-api.railway.app/api
NEXT_PUBLIC_SOLANA_NETWORK=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=<YOUR_PROGRAM_ID>
NEXT_PUBLIC_APP_NAME=DealVault
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

#### 5. Redeploy with Environment Variables

```bash
vercel --prod
```

Your site will be live at: `https://your-project.vercel.app`

### Option 2: Deploy to Netlify

#### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2. Login

```bash
netlify login
```

#### 3. Initialize and Deploy

```bash
cd frontend

# Initialize
netlify init

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

#### 4. Set Environment Variables

```bash
# Via CLI
netlify env:set NEXT_PUBLIC_API_URL "https://your-api.railway.app/api"
netlify env:set NEXT_PUBLIC_SOLANA_NETWORK "https://api.devnet.solana.com"
netlify env:set NEXT_PUBLIC_PROGRAM_ID "<YOUR_PROGRAM_ID>"

# Or via Netlify dashboard → Site Settings → Environment variables
```

### Custom Domain for Frontend

#### Vercel:
- Go to Project Settings → Domains
- Add custom domain: `dealvault.io`
- Update DNS with provided records

#### Netlify:
- Go to Site Settings → Domain Management
- Add custom domain
- Update DNS with provided records

## Environment Configuration

### Production Environment Variables

#### Smart Contracts (.env)
```env
# Not typically needed for smart contracts
# Configuration is in Anchor.toml
```

#### Backend API (.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Solana Configuration
SOLANA_NETWORK=https://api.devnet.solana.com
# or for mainnet: https://api.mainnet-beta.solana.com
PROGRAM_ID=<YOUR_DEPLOYED_PROGRAM_ID>

# Frontend CORS
FRONTEND_URL=https://your-frontend-domain.com

# External APIs (optional)
SKYSCANNER_API_KEY=your_key_here
BOOKING_API_KEY=your_key_here
SHOPIFY_API_KEY=your_key_here

# Database (if using)
DATABASE_URL=postgresql://...

# Redis (if using)
REDIS_URL=redis://...

# Logging
LOG_LEVEL=info
```

#### Frontend (.env.local or deployment platform)
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yoursite.com/api

# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=<YOUR_DEPLOYED_PROGRAM_ID>

# Application Settings
NEXT_PUBLIC_APP_NAME=DealVault
NEXT_PUBLIC_APP_URL=https://yoursite.com

# Analytics (optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS=G-XXXXXXXXXX
```

## Post-Deployment Checklist

After deploying all components, verify everything works:

### 1. Smart Contracts ✓
- [ ] Program is deployed and visible on Solana Explorer
- [ ] Program ID is correct in all configurations
- [ ] Test transactions work on the network
- [ ] Accounts can be created and modified

**Test:**
```bash
solana program show <PROGRAM_ID>
```

### 2. Backend API ✓
- [ ] Health check endpoint responds
- [ ] CORS is configured correctly
- [ ] Connects to Solana network successfully
- [ ] All endpoints return expected responses
- [ ] Environment variables are set correctly

**Test:**
```bash
curl https://your-api.com/health
curl https://your-api.com/api/deals
```

### 3. Frontend ✓
- [ ] Site loads without errors
- [ ] Wallet connection works
- [ ] Can browse deals
- [ ] Can connect to API
- [ ] All images and assets load
- [ ] Mobile responsive
- [ ] SSL certificate is active (HTTPS)

**Test:**
- Open site in browser
- Check browser console for errors
- Test on mobile device
- Try wallet connection
- Attempt to purchase a test deal

### 4. Integration ✓
- [ ] Frontend can call API
- [ ] API can call smart contracts
- [ ] Transactions can be signed and sent
- [ ] Data flows correctly through all layers

**End-to-end test:**
1. Browse deals on frontend
2. Connect wallet
3. Purchase a deal
4. Verify transaction on Solana Explorer
5. Check coupon appears correctly

## Monitoring and Maintenance

### Logging

**Backend API:**
```javascript
// Use Morgan for request logging
app.use(morgan('combined'));

// Log errors
console.error('Error:', error);
```

**Frontend:**
```javascript
// Use browser console
console.log('Action:', action);
console.error('Error:', error);

// Consider Sentry for production
```

### Monitoring Services

**Recommended tools:**
- **Uptime monitoring:** UptimeRobot, Pingdom
- **Error tracking:** Sentry, Rollbar
- **Analytics:** Google Analytics, Plausible
- **Logs:** Papertrail, Loggly

### Regular Maintenance

**Weekly:**
- Check error logs
- Monitor uptime
- Review transaction success rates

**Monthly:**
- Update dependencies
- Review security advisories
- Backup important data
- Check Solana account rent

**As Needed:**
- Deploy bug fixes
- Add new features
- Upgrade program if needed

## Troubleshooting

### Smart Contract Issues

**Problem:** Deployment fails with "insufficient funds"
```bash
# Solution: Get more SOL
solana airdrop 2  # devnet
# or transfer SOL from exchange (mainnet)
```

**Problem:** Transaction fails with "Program failed to complete"
```bash
# Solution: Check program logs
solana logs <PROGRAM_ID>
```

**Problem:** Can't find program after deployment
```bash
# Solution: Verify Program ID matches everywhere
grep -r "PROGRAM_ID" .
```

### Backend API Issues

**Problem:** API not connecting to Solana
```bash
# Solution: Check network URL and connectivity
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

**Problem:** CORS errors
```javascript
// Solution: Update CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

**Problem:** Environment variables not loading
```bash
# Solution: Check .env file exists and is loaded
console.log('Env check:', process.env.PROGRAM_ID);
```

### Frontend Issues

**Problem:** Wallet won't connect
```javascript
// Solution: Check wallet adapter configuration
// Ensure correct network (devnet vs mainnet)
const endpoint = process.env.NEXT_PUBLIC_SOLANA_NETWORK;
```

**Problem:** API calls fail
```bash
# Solution: Check API URL and CORS
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

**Problem:** Build fails
```bash
# Solution: Clear cache and rebuild
rm -rf .next
npm run build
```

## Rollback Procedure

If deployment goes wrong, here's how to rollback:

### Smart Contracts
```bash
# Solana programs are immutable once deployed
# To "rollback", deploy a previous version as a new program
# Update all references to the old Program ID

# Or use upgradeable programs (Anchor default)
anchor upgrade <path-to-old-binary> --program-id <PROGRAM_ID>
```

### Backend API

**Railway:**
```bash
railway rollback
```

**Render:**
- Go to dashboard → Deployments
- Click "Rollback" on previous deployment

### Frontend

**Vercel:**
```bash
# List deployments
vercel ls

# Promote old deployment to production
vercel promote <deployment-url>
```

**Netlify:**
- Go to Deploys
- Click "Publish deploy" on old deployment

## Security Considerations

### Production Security Checklist

- [ ] Use HTTPS for all services
- [ ] Set secure environment variables
- [ ] Never commit private keys
- [ ] Enable rate limiting on API
- [ ] Use secrets management service
- [ ] Regular security audits
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated

### Wallet Security

- Never expose private keys
- Use hardware wallet for mainnet deployments
- Keep deployment wallet separate from operational wallet
- Backup keypairs securely

### API Security

```javascript
// Rate limiting
const rateLimit = require("express-rate-limit");
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Helmet for security headers
const helmet = require('helmet');
app.use(helmet());
```

## Cost Estimates

### Devnet (Testing)
- Smart Contract Deployment: FREE (use faucet)
- Backend API: FREE (Railway free tier)
- Frontend: FREE (Vercel free tier)
- **Total: $0/month**

### Mainnet (Production)
- Smart Contract Deployment: ~5 SOL one-time (~$500)
- Backend API: $5-20/month (Railway Starter)
- Frontend: $20/month (Vercel Pro)
- Domain: $10-15/year
- **Total: ~$500 initial + $25-40/month**

### Scaling Costs (High Traffic)
- Backend API: $50-200/month
- Frontend: $50-100/month (Vercel bandwidth)
- Database: $15-50/month (if added)
- **Total: ~$115-350/month**

## Next Steps After Deployment

1. **Announce Launch**
   - Post on social media
   - Share with community
   - Submit to directories

2. **Monitor Performance**
   - Set up monitoring
   - Watch error rates
   - Track user feedback

3. **Iterate Based on Feedback**
   - Fix bugs quickly
   - Add requested features
   - Improve UX

4. **Scale as Needed**
   - Upgrade hosting plans
   - Add caching layer
   - Optimize database

## Support

If you run into issues during deployment:

1. Check this guide's troubleshooting section
2. Review platform-specific documentation
3. Check Solana/Anchor documentation
4. Search for error messages
5. Ask in relevant Discord/forums

## Summary

Deploying DealVault involves three main steps:

1. **Deploy smart contracts** to Solana devnet/mainnet
2. **Deploy backend API** to Railway/Render
3. **Deploy frontend** to Vercel/Netlify

Each step builds on the previous one. Take your time, verify each step, and test thoroughly before moving to the next.

For additional help, see:
- [SETUP.md](./SETUP.md) - Local development
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [README.md](./README.md) - Project overview

---

**Good luck with your deployment!**

*Last updated: October 31, 2025*

