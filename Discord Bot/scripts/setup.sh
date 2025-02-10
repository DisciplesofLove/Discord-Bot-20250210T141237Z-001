#!/bin/bash

# Setup script for initializing the application environment

echo "Starting setup process..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Create necessary directories
echo "Creating required directories..."
mkdir -p logs
mkdir -p data
mkdir -p uploads

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
fi

# Initialize the database
echo "Initializing database..."
node scripts/setup/init-database.js

# Setup environment
echo "Setting up environment..."
node scripts/setup/setup-environment.js

echo "Setup completed successfully!"