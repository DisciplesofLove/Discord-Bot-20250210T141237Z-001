const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables
require('dotenv').config();

async function deployBackend() {
    console.log('Starting backend deployment...');

    try {
        // Verify environment
        if (!process.env.DEPLOY_ENV) {
            throw new Error('DEPLOY_ENV not set in environment variables');
        }

        // Build the application
        console.log('Building backend application...');
        execSync('npm run build', { stdio: 'inherit' });

        // Copy configuration files
        console.log('Copying configuration files...');
        const configSource = path.join(__dirname, '../../config', `${process.env.DEPLOY_ENV}.json`);
        const configDest = path.join(__dirname, '../../dist/config.json');
        fs.copyFileSync(configSource, configDest);

        // Deploy to server
        console.log('Deploying to server...');
        // Add your deployment logic here (e.g., AWS, Docker, etc.)
        
        if (process.env.DEPLOY_PLATFORM === 'aws') {
            // AWS deployment logic
            console.log('Deploying to AWS...');
            execSync('aws deploy create-deployment', { stdio: 'inherit' });
        } else if (process.env.DEPLOY_PLATFORM === 'docker') {
            // Docker deployment logic
            console.log('Deploying with Docker...');
            execSync('docker-compose up -d', { stdio: 'inherit' });
        }

        console.log('Backend deployment completed successfully');
    } catch (error) {
        console.error('Backend deployment failed:', error);
        process.exit(1);
    }
}

// Execute deployment
deployBackend();