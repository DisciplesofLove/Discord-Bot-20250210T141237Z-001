const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables
require('dotenv').config();

async function deployBot() {
    console.log('Starting bot deployment...');

    try {
        // Verify environment
        if (!process.env.DISCORD_TOKEN) {
            throw new Error('DISCORD_TOKEN not set in environment variables');
        }

        // Build the bot
        console.log('Building bot application...');
        execSync('npm run build:bot', { stdio: 'inherit' });

        // Register slash commands
        console.log('Registering Discord slash commands...');
        execSync('npm run discord:register', { stdio: 'inherit' });

        // Deploy bot
        console.log('Deploying bot...');
        if (process.env.DEPLOY_PLATFORM === 'aws') {
            // AWS deployment using blue-green deployment
            const blueGreenDeploy = require('./blue-green-deploy');
            await blueGreenDeploy.deploy();
        } else if (process.env.DEPLOY_PLATFORM === 'docker') {
            // Docker deployment logic
            console.log('Deploying with Docker...');
            execSync('docker-compose up -d discord-bot', { stdio: 'inherit' });
        }

        console.log('Bot deployment completed successfully');
    } catch (error) {
        console.error('Bot deployment failed:', error);
        process.exit(1);
    }
}

// Execute deployment
deployBot();