# Akash Deployment Guide

This project now supports deployment to the Akash Network, a decentralized computing platform.

## Prerequisites

1. Set up your Akash wallet and obtain AKT tokens
2. Copy `.env.deployment` to `.env` and configure your Akash-specific variables
3. Ensure you have the Akash CLI installed

## Deployment Steps

1. Ensure your environment variables are set:
   ```bash
   cp .env.deployment .env
   ```

2. Run the deployment script:
   ```bash
   node scripts/deployment/deploy-backend.js
   ```

3. Monitor your deployment on the Akash Network dashboard

## Environment Variables

- `DEPLOY_PLATFORM`: Set to 'akash' for Akash deployment
- `DEPLOY_ENV`: Your deployment environment (production/staging)
- `AKASH_RPC_ENDPOINT`: Akash network RPC endpoint
- `AKASH_CHAIN_ID`: Akash network chain ID

## Troubleshooting

If you encounter any issues, check:
1. Your Akash wallet has sufficient AKT tokens
2. The RPC endpoint is accessible
3. Your deployment configuration in the AkashService