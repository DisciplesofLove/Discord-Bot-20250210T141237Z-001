#!/bin/bash

# Deployment script for the application

echo "Starting deployment process..."

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo ".env file not found!"
    exit 1
fi

# Check deployment environment
ENV=${1:-production}
echo "Deploying to $ENV environment..."

# Run tests
echo "Running tests..."
npm test

if [ $? -ne 0 ]; then
    echo "Tests failed! Aborting deployment."
    exit 1
fi

# Build application
echo "Building application..."
npm run build

# Deploy backend
echo "Deploying backend..."
node scripts/deployment/deploy-backend.js

# Deploy bot
echo "Deploying bot..."
node scripts/deployment/deploy-bot.js

echo "Deployment completed successfully!"