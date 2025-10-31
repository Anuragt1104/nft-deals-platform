# DealVault Documentation Index

Welcome to the DealVault documentation! This index will help you find exactly what you need.

## Quick Navigation

**Just want to see it work?** → [JUDGES_GUIDE.md](./JUDGES_GUIDE.md)  
**Want to run it locally?** → [SETUP.md](./SETUP.md)  
**Want to understand how it works?** → [ARCHITECTURE.md](./ARCHITECTURE.md)  
**Want to dive into the code?** → [CODE_STRUCTURE.md](./CODE_STRUCTURE.md)  
**Want to deploy it?** → [DEPLOYMENT.md](./DEPLOYMENT.md)

## All Documentation Files

### 1. README.md - Start Here
**What it covers:**
- Project overview and introduction
- Problem statement and solution
- How it works (user and merchant perspectives)
- Key features and benefits
- Technology stack
- Quick start guide
- Repository structure overview

**Read this if you:**
- Are new to the project
- Want a high-level overview
- Need context before diving deeper

**Estimated reading time:** 10-15 minutes

---

### 2. JUDGES_GUIDE.md - For Hackathon Judges
**What it covers:**
- 30-second elevator pitch
- Quick demo instructions (2 minutes)
- Key features checklist
- Technical highlights
- How to evaluate the project
- Response to judging criteria
- Anticipated Q&A

**Read this if you:**
- Are judging this hackathon submission
- Want the fastest path to understanding
- Need to evaluate against criteria
- Want to see what's implemented

**Estimated reading time:** 5-10 minutes

---

### 3. SETUP.md - Installation Guide
**What it covers:**
- System requirements
- Prerequisite installation (Node.js, Rust, Solana CLI, Anchor)
- Step-by-step project setup
- Smart contract deployment
- Backend API configuration
- Frontend setup
- Testing instructions
- Troubleshooting common issues

**Read this if you:**
- Want to run the project locally
- Need to set up your development environment
- Are encountering installation issues
- Want to test features yourself

**Estimated reading time:** 20-30 minutes  
**Time to complete setup:** 30-60 minutes

---

### 4. ARCHITECTURE.md - Technical Design
**What it covers:**
- High-level system architecture
- Three-tier layer explanation
- Smart contract design deep dive
- Backend API architecture
- Frontend architecture
- Complete data flow diagrams
- Security considerations
- Design decisions and trade-offs
- Scalability considerations

**Read this if you:**
- Want to understand the technical design
- Are evaluating the architecture
- Need to know why certain choices were made
- Want to contribute or extend the project
- Are interested in system design

**Estimated reading time:** 30-45 minutes

---

### 5. CODE_STRUCTURE.md - Code Walkthrough
**What it covers:**
- Repository structure explained
- Smart contract code breakdown (every function)
- Backend API code explanation
- Frontend component walkthrough
- Configuration files explained
- Key code patterns
- What each file does
- How components connect

**Read this if you:**
- Want to understand the codebase
- Are reviewing code quality
- Need to modify or extend functionality
- Want to learn from the implementation
- Are debugging an issue

**Estimated reading time:** 45-60 minutes

---

### 6. API_REFERENCE.md - API Documentation
**What it covers:**
- All REST endpoints documented
- Request/response examples
- Query parameters and options
- Error responses and codes
- Rate limiting information
- Authentication (future)
- Testing examples (cURL, JavaScript, Python)
- Webhook events (future)

**Read this if you:**
- Want to integrate with the API
- Need endpoint specifications
- Are testing API functionality
- Want to build a client library
- Need to debug API calls

**Estimated reading time:** 20-30 minutes  
**Reference material:** Keep open while developing

---

### 7. VISUAL_GUIDE.md - Diagrams & Flows
**What it covers:**
- System architecture diagram
- User purchase flow (step-by-step)
- Merchant deal creation flow
- Coupon redemption flow
- Data relationship diagrams
- Smart contract interaction flows
- Technology stack visualization
- Development environment setup
- Deployment architecture

**Read this if you:**
- Are a visual learner
- Want to see how data flows
- Need to understand interactions
- Are presenting the project
- Want quick reference diagrams

**Estimated reading time:** 15-20 minutes

---

### 8. DEPLOYMENT.md - Production Deployment
**What it covers:**
- Deploying smart contracts to devnet/mainnet
- Backend API deployment (Railway, Render)
- Frontend deployment (Vercel, Netlify)
- Environment configuration for production
- Custom domain setup
- Post-deployment checklist
- Monitoring and maintenance
- Troubleshooting deployment issues
- Rollback procedures
- Security considerations
- Cost estimates

**Read this if you:**
- Want to deploy to production
- Need deployment instructions
- Are setting up monitoring
- Encountered deployment issues
- Want to estimate costs

**Estimated reading time:** 30-40 minutes  
**Time to deploy:** 1-2 hours

---

## Documentation by Role

### For Hackathon Judges
**Recommended reading order:**
1. [JUDGES_GUIDE.md](./JUDGES_GUIDE.md) - Quick overview and evaluation
2. [VISUAL_GUIDE.md](./VISUAL_GUIDE.md) - See how it works visually
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical depth
4. [CODE_STRUCTURE.md](./CODE_STRUCTURE.md) - Code quality review

**Total time:** ~1 hour for thorough evaluation

### For Developers Wanting to Run It
**Recommended reading order:**
1. [README.md](./README.md) - Context and overview
2. [SETUP.md](./SETUP.md) - Installation instructions
3. [CODE_STRUCTURE.md](./CODE_STRUCTURE.md) - Understanding the code
4. [API_REFERENCE.md](./API_REFERENCE.md) - API details

**Total time:** ~1-2 hours

### For Developers Wanting to Deploy It
**Recommended reading order:**
1. [README.md](./README.md) - Overview
2. [SETUP.md](./SETUP.md) - Local setup first
3. [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
4. [ARCHITECTURE.md](./ARCHITECTURE.md) - Understanding the system

**Total time:** ~2-3 hours

### For Developers Wanting to Extend It
**Recommended reading order:**
1. [README.md](./README.md) - Context
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - Design decisions
3. [CODE_STRUCTURE.md](./CODE_STRUCTURE.md) - Code walkthrough
4. [API_REFERENCE.md](./API_REFERENCE.md) - API contracts
5. [VISUAL_GUIDE.md](./VISUAL_GUIDE.md) - Flow diagrams

**Total time:** ~2-3 hours

### For Users/Non-Technical Stakeholders
**Recommended reading:**
1. [README.md](./README.md) - Overview and benefits (skip technical parts)
2. [JUDGES_GUIDE.md](./JUDGES_GUIDE.md) - Quick demo and features
3. [VISUAL_GUIDE.md](./VISUAL_GUIDE.md) - Visual flows

**Total time:** ~20-30 minutes

## Documentation Features

### Complete Coverage
- ✅ Project overview
- ✅ Setup instructions
- ✅ Architecture explanation
- ✅ Code walkthrough
- ✅ API reference
- ✅ Visual diagrams
- ✅ Deployment guide
- ✅ Troubleshooting

### Written for Humans
- Clear, simple language
- No unnecessary jargon
- Step-by-step instructions
- Real examples
- Visual aids

### Multiple Learning Styles
- Text explanations
- Code examples
- Visual diagrams
- Step-by-step guides
- Quick references

### Practical and Useful
- Copy-paste commands
- Real configuration examples
- Common issues addressed
- Best practices included
- Production-ready guidance

## Quick Reference Cards

### Setup in 3 Steps
```bash
# 1. Deploy smart contracts
cd smart-contracts && anchor build && anchor deploy

# 2. Start API
cd ../api && npm install && npm run dev

# 3. Start frontend
cd ../frontend && npm install && npm run dev
```

### Key Files to Know
```
smart-contracts/programs/smart-contracts/src/lib.rs  # Smart contracts
api/src/index.ts                                      # API entry
api/src/routes/deals.ts                               # Deal endpoints
frontend/src/app/page.tsx                             # Homepage
frontend/src/components/DealCard.tsx                  # Deal component
```

### Key Commands
```bash
# Build smart contracts
anchor build

# Deploy smart contracts
anchor deploy

# Run API server
npm run dev         # (from api directory)

# Run frontend
npm run dev         # (from frontend directory)

# Test smart contracts
anchor test
```

### Environment Variables
```env
# Backend (.env)
SOLANA_NETWORK=http://localhost:8899
PROGRAM_ID=<deployed_program_id>
PORT=3001

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOLANA_NETWORK=http://localhost:8899
NEXT_PUBLIC_PROGRAM_ID=<deployed_program_id>
```

## Documentation Statistics

- **Total Files:** 8 comprehensive markdown files
- **Total Words:** ~50,000 words
- **Total Lines:** ~3,500 lines of documentation
- **Code Examples:** 100+ code snippets
- **Diagrams:** 15+ ASCII diagrams
- **Coverage:** Every component, file, and function documented

## Getting Help

If you can't find what you need in the documentation:

1. **Check the relevant doc** based on your role/goal above
2. **Search the documentation** (Ctrl/Cmd + F in each file)
3. **Look at code comments** in the source files
4. **Check troubleshooting sections** in SETUP.md and DEPLOYMENT.md
5. **Open an issue** on GitHub if something is unclear

## Contributing to Documentation

Found something unclear or missing? We welcome documentation improvements!

**To contribute:**
1. Fork the repository
2. Update the relevant .md file
3. Submit a pull request with clear description
4. Explain what was unclear and how you improved it

## Documentation Maintenance

**Last Updated:** October 31, 2025  
**Project Version:** 1.0.0  
**Maintained by:** DealVault Team

**Update frequency:**
- Major updates: With each release
- Minor updates: As needed for clarity
- Corrections: Immediately upon discovery

## Final Notes

This documentation represents our commitment to making DealVault:
- **Accessible** - Easy to understand for everyone
- **Comprehensive** - Covers everything you need
- **Practical** - Real examples and instructions
- **Visual** - Diagrams and flows included
- **Production-Ready** - Deployment and maintenance covered

We believe great code deserves great documentation. Enjoy exploring DealVault!

---

**For the MonkeDAO Track at Cypherpunk Hackathon**  
**Project:** DealVault - NFT-Powered Deal Discovery Platform  
**Mission:** Build the next evolution of Groupon  
**Date:** October 31, 2025

---

### Quick Links

- **Main README:** [README.md](./README.md)
- **Setup Guide:** [SETUP.md](./SETUP.md)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Code Structure:** [CODE_STRUCTURE.md](./CODE_STRUCTURE.md)
- **API Reference:** [API_REFERENCE.md](./API_REFERENCE.md)
- **Visual Guide:** [VISUAL_GUIDE.md](./VISUAL_GUIDE.md)
- **Judges Guide:** [JUDGES_GUIDE.md](./JUDGES_GUIDE.md)
- **Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)

Happy reading! 📚

