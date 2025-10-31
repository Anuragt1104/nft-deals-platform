# DealVault Setup Guide

This guide will walk you through setting up DealVault on your local machine, step by step. Don't worry if you're new to Solana development - we'll explain everything clearly.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Prerequisites Installation](#prerequisites-installation)
3. [Project Setup](#project-setup)
4. [Smart Contract Deployment](#smart-contract-deployment)
5. [Backend API Setup](#backend-api-setup)
6. [Frontend Setup](#frontend-setup)
7. [Testing the Application](#testing-the-application)
8. [Troubleshooting](#troubleshooting)
9. [Deployment to Production](#deployment-to-production)

## System Requirements

Before you begin, make sure your system meets these requirements:

- **Operating System**: macOS, Linux, or Windows (WSL2 recommended)
- **RAM**: At least 8GB (16GB recommended)
- **Storage**: At least 10GB free space
- **Internet**: Stable connection for downloading dependencies

## Prerequisites Installation

You'll need to install several tools before you can run DealVault. Let's go through them one by one.

### 1. Node.js and npm

Node.js is required for both the frontend and backend. We recommend Node.js version 18 or higher.

**Check if you already have it:**
```bash
node --version
npm --version
```

**Installation:**

**macOS (using Homebrew):**
```bash
brew install node
```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows:**
Download from [nodejs.org](https://nodejs.org/) and run the installer.

### 2. Rust and Cargo

Rust is needed to compile the Solana smart contracts.

**Check if you already have it:**
```bash
rustc --version
cargo --version
```

**Installation:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

After installation, restart your terminal or run:
```bash
source $HOME/.cargo/env
```

### 3. Solana CLI

The Solana command-line tools are essential for deploying and interacting with smart contracts.

**Installation:**
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

**Verify installation:**
```bash
solana --version
```

**Configure Solana CLI:**
```bash
# Set to localhost for development
solana config set --url localhost

# Create a new wallet (if you don't have one)
solana-keygen new --outfile ~/.config/solana/id.json

# Check your configuration
solana config get
```

### 4. Anchor Framework

Anchor is a framework that makes Solana smart contract development much easier.

**Installation:**
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

**Verify installation:**
```bash
anchor --version
```

### 5. Solana Wallet Browser Extension

You'll need a Solana wallet to interact with the application.

**Recommended wallets:**
- **Phantom**: [phantom.app](https://phantom.app/) - User-friendly, most popular
- **Solflare**: [solflare.com](https://solflare.com/) - Feature-rich alternative

Install either one as a browser extension and create a wallet. Make sure to:
1. Save your seed phrase securely
2. Add some SOL for testing (we'll explain how below)

## Project Setup

Now that all prerequisites are installed, let's set up the project.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nft-deals-platform
```

### 2. Project Structure Overview

Here's what each directory contains:

```
nft-deals-platform/
├── smart-contracts/   # Blockchain smart contracts (Rust)
├── api/              # Backend REST API (TypeScript)
├── frontend/         # Web interface (Next.js + React)
├── docs/             # Documentation
└── scripts/          # Utility scripts
```

We'll set up each component separately.

## Smart Contract Deployment

Let's start with deploying the smart contracts to your local Solana validator.

### Step 1: Start Local Validator

Open a new terminal window and run:

```bash
solana-test-validator
```

This starts a local Solana blockchain on your machine. Keep this terminal running - if you close it, your local blockchain will stop.

**What you'll see:**
```
Ledger location: /Users/you/.config/solana/test-ledger
Identity: [some public key]
Genesis Hash: [some hash]
Version: [version number]
```

### Step 2: Fund Your Wallet

In a new terminal (keep the validator running), add some SOL to your wallet for testing:

```bash
solana airdrop 10
```

This gives you 10 SOL on your local test network (it's not real SOL, just for testing).

**Verify your balance:**
```bash
solana balance
```

### Step 3: Build the Smart Contracts

Navigate to the smart contracts directory:

```bash
cd smart-contracts
```

**Install dependencies:**
```bash
npm install
```

**Build the contracts:**
```bash
anchor build
```

This compiles your Rust code into a program that can run on Solana. It might take a few minutes the first time.

**What happens during build:**
- Rust code is compiled to BPF (Berkeley Packet Filter) bytecode
- TypeScript types are generated for easy frontend integration
- An IDL (Interface Definition Language) file is created describing your program

### Step 4: Deploy to Local Network

```bash
anchor deploy
```

**Important:** After deployment, you'll see output like:

```
Program Id: 2TfqdC8KVcDgEeN5EEF1GpFnmWTGr7woUiRnPNMoMoLC
```

**Copy this Program Id!** You'll need it for the frontend and API configuration.

### Step 5: Run Tests (Optional but Recommended)

Verify everything works correctly:

```bash
anchor test
```

If all tests pass, your smart contracts are working correctly!

## Backend API Setup

The backend API provides REST endpoints and integrates with external deal services.

### Step 1: Navigate to API Directory

```bash
cd ../api
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all the necessary packages like Express, Solana Web3.js, and more.

### Step 3: Configure Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Solana Configuration
SOLANA_NETWORK=http://localhost:8899
PROGRAM_ID=2TfqdC8KVcDgEeN5EEF1GpFnmWTGr7woUiRnPNMoMoLC

# External API Keys (optional for basic testing)
SKYSCANNER_API_KEY=your_key_here
BOOKING_API_KEY=your_key_here
SHOPIFY_API_KEY=your_key_here
```

**Important fields:**
- `SOLANA_NETWORK`: Should be `http://localhost:8899` for local development
- `PROGRAM_ID`: Use the Program Id from your smart contract deployment
- `FRONTEND_URL`: Where your frontend will run

### Step 4: Build the API

```bash
npm run build
```

This compiles TypeScript to JavaScript.

### Step 5: Start the Development Server

```bash
npm run dev
```

**You should see:**
```
🚀 DealVault API server running on port 3001
📱 Health check: http://localhost:3001/health
🌐 Environment: development
```

**Test the health check:**
Open `http://localhost:3001/health` in your browser. You should see:
```json
{
  "status": "OK",
  "timestamp": "2025-10-31T...",
  "version": "1.0.0",
  "service": "DealVault API"
}
```

Keep this terminal running!

## Frontend Setup

Now let's set up the user interface.

### Step 1: Navigate to Frontend Directory

```bash
cd ../frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit the `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=http://localhost:8899
NEXT_PUBLIC_PROGRAM_ID=2TfqdC8KVcDgEeN5EEF1GpFnmWTGr7woUiRnPNMoMoLC

# Application Settings
NEXT_PUBLIC_APP_NAME=DealVault
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:**
- All frontend environment variables must start with `NEXT_PUBLIC_` to be accessible in the browser
- Make sure the `PROGRAM_ID` matches your deployed contract

### Step 4: Start the Development Server

```bash
npm run dev
```

**You should see:**
```
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
```

## Testing the Application

Congratulations! All components should now be running. Let's test the full application.

### What Should Be Running

You should have these terminals open:

```
Terminal 1: solana-test-validator  (local blockchain)
Terminal 2: npm run dev            (API server - port 3001)
Terminal 3: npm run dev            (Frontend - port 3000)
```

### Step 1: Access the Application

Open your browser and go to `http://localhost:3000`

You should see the DealVault homepage with:
- A hero section explaining the platform
- Feature cards
- Featured deals section
- Call-to-action buttons

### Step 2: Connect Your Wallet

1. Click "Connect Wallet" in the navigation bar
2. Select your wallet (Phantom or Solflare)
3. Approve the connection in the wallet popup
4. Your wallet address should now appear in the navbar

### Step 3: Browse the Marketplace

1. Click "Explore Deals" or navigate to `/marketplace`
2. You'll see available deals with:
   - Discount percentages
   - Original and discounted prices
   - Time remaining
   - Supply available
   - Merchant information

### Step 4: Test Deal Purchase (User Flow)

1. Click on any deal to view details
2. Click "Buy Now"
3. Your Solana wallet will prompt you to approve the transaction
4. After approval, you'll receive:
   - A confirmation message
   - An NFT coupon in your wallet
   - A QR code for redemption

### Step 5: Test Merchant Dashboard

1. Navigate to `/merchant` in your browser
2. This is where merchants create deals
3. Try creating a test deal:
   - Fill in title, description, prices
   - Set discount percentage
   - Choose expiry date and supply limit
   - Click "Create Deal"
   - Approve the transaction in your wallet

### Step 6: Test Deal Redemption

1. As a user, view your purchased coupon
2. Show the QR code
3. As a merchant, scan the QR code (or manually enter the redemption code)
4. Confirm redemption on-chain
5. The coupon status should update to "Redeemed"

## Troubleshooting

### Issue: "solana-test-validator" not found

**Solution:**
```bash
# Add Solana to your PATH
export PATH="/Users/$USER/.local/share/solana/install/active_release/bin:$PATH"

# Add to your shell profile to make it permanent
echo 'export PATH="/Users/$USER/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Issue: "anchor: command not found"

**Solution:**
```bash
# Reinstall Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### Issue: Wallet doesn't connect

**Solutions:**
1. Make sure your wallet extension is installed and unlocked
2. Check that you're on the correct network (localhost for development)
3. Try refreshing the page and reconnecting
4. Clear browser cache and try again

### Issue: Transaction fails with "insufficient funds"

**Solution:**
```bash
# Airdrop more SOL to your wallet
solana airdrop 10

# Check balance
solana balance
```

### Issue: API returns CORS errors

**Solution:**
Check that `FRONTEND_URL` in `api/.env` matches your frontend URL:
```env
FRONTEND_URL=http://localhost:3000
```

### Issue: Smart contract deployment fails

**Solutions:**
1. Make sure the validator is running
2. Check you have enough SOL: `solana balance`
3. Try rebuilding: `anchor clean && anchor build`
4. Check the validator logs for errors

### Issue: Frontend shows "Network Error"

**Solutions:**
1. Verify the API is running on port 3001
2. Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
3. Test the API health check: `curl http://localhost:3001/health`

## Deployment to Production

While this project was built for a hackathon, here's how you'd deploy to production.

### Smart Contracts to Devnet/Mainnet

1. **Configure network:**
```bash
# For devnet
solana config set --url devnet

# For mainnet (when ready)
solana config set --url mainnet-beta
```

2. **Get some real SOL** (for devnet, use the faucet; for mainnet, you'll need to purchase)
```bash
# Devnet faucet
solana airdrop 2
```

3. **Deploy:**
```bash
cd smart-contracts
anchor build
anchor deploy --provider.cluster devnet
```

### Backend API

Deploy to a service like:
- **Railway**: Easy Node.js hosting
- **Render**: Free tier available
- **AWS/Google Cloud**: More control, scalable
- **Heroku**: Simple deployment

**Environment variables to set:**
- `SOLANA_NETWORK`: `https://api.devnet.solana.com` or `https://api.mainnet-beta.solana.com`
- `PROGRAM_ID`: Your deployed program ID
- All API keys for external services

### Frontend

Deploy to:
- **Vercel**: Excellent Next.js support (recommended)
- **Netlify**: Good alternative
- **AWS Amplify**: If using AWS for backend

**Deployment command for Vercel:**
```bash
cd frontend
vercel --prod
```

**Remember to set environment variables in Vercel:**
- All `NEXT_PUBLIC_*` variables
- API URL should point to your deployed API

## Development Tips

### Hot Reload

All three components support hot reload:
- Smart contracts: Use `anchor test --skip-build` to skip rebuilding during testing
- API: `nodemon` watches for file changes automatically
- Frontend: Next.js hot reloads on save

### Debugging

**Smart Contracts:**
```bash
# View program logs
solana logs
```

**API:**
```bash
# Enable debug logging
export DEBUG=express:*
npm run dev
```

**Frontend:**
- Use React DevTools browser extension
- Check browser console for errors
- Use Next.js built-in debugger

### Resetting Local State

If you need to start fresh:

```bash
# Stop the validator
# Delete the test ledger
rm -rf ~/.config/solana/test-ledger

# Restart validator
solana-test-validator

# Redeploy contracts
cd smart-contracts
anchor deploy
```

## Next Steps

Now that you have DealVault running:

1. **Explore the code**: Check out [CODE_STRUCTURE.md](./CODE_STRUCTURE.md) for detailed code explanations
2. **Understand the architecture**: Read [ARCHITECTURE.md](./ARCHITECTURE.md) to learn how everything fits together
3. **Customize**: Try modifying deals, adding features, or changing the UI
4. **Test thoroughly**: Try edge cases and error scenarios
5. **Deploy**: When ready, follow the production deployment steps above

## Getting Help

If you run into issues:

1. Check this troubleshooting section
2. Review the logs in each terminal
3. Search for error messages online
4. Open an issue on GitHub
5. Check Solana and Anchor documentation

## Summary

You should now have:
- ✅ Local Solana validator running
- ✅ Smart contracts deployed
- ✅ API server running on port 3001
- ✅ Frontend running on port 3000
- ✅ Wallet connected
- ✅ Ability to create, purchase, and redeem deals

Happy building!

