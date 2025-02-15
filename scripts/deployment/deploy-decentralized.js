const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { AkashService } = require('../../Discord Bot/backend/src/services/core/akash.service');
const { IPFSService } = require('../../Discord Bot/backend/src/services/core/ipfs.service');
const OrbitDB = require('orbit-db');

// Load environment variables
require('dotenv').config();

async function deployDecentralized() {
    console.log('Starting decentralized deployment...');

    try {
        // Verify environment
        if (!process.env.DEPLOY_ENV) {
            throw new Error('DEPLOY_ENV not set in environment variables');
        }

        // Initialize services
        const akash = new AkashService();
        const ipfs = new IPFSService();

        // Build the application
        console.log('Building application...');
        execSync('npm run build', { stdio: 'inherit' });

        // Copy configuration files
        console.log('Copying configuration files...');
        const configSource = path.join(__dirname, '../../config', `${process.env.DEPLOY_ENV}.json`);
        const configDest = path.join(__dirname, '../../dist/config.json');
        fs.copyFileSync(configSource, configDest);

        // Upload application to IPFS
        console.log('Uploading to IPFS...');
        const ipfsHash = await ipfs.store('./dist', {
            recursive: true,
            pin: true
        });
        console.log(`Application uploaded to IPFS with hash: ${ipfsHash}`);

        // Deploy to Akash Network
        console.log('Deploying to Akash Network...');
        const deploymentConfig = {
            environment: process.env.DEPLOY_ENV,
            ipfsHash,
            resources: {
                cpu: '2',
                memory: '4Gi',
                storage: '20Gi'
            },
            replicas: process.env.DEPLOY_ENV === 'production' ? 3 : 1
        };

        const deploymentId = await akash.deployApplication(deploymentConfig);
        console.log(`Deployment created on Akash with ID: ${deploymentId}`);

        // Initialize OrbitDB
        console.log('Setting up OrbitDB...');
        const orbitdb = await OrbitDB.createInstance(ipfs.node);
        const db = await orbitdb.log('discord-bot-metrics');
        console.log(`OrbitDB database created with address: ${db.address}`);

        // Setup monitoring
        console.log('Setting up monitoring...');
        const monitoringConfig = {
            prometheusEndpoint: process.env.PROMETHEUS_ENDPOINT,
            grafanaUrl: process.env.GRAFANA_URL
        };
        await akash.setupMonitoring(deploymentId, monitoringConfig);

        console.log('Decentralized deployment completed successfully');
        return {
            deploymentId,
            ipfsHash,
            dbAddress: db.address
        };
    } catch (error) {
        console.error('Decentralized deployment failed:', error);
        process.exit(1);
    }
}

module.exports = deployDecentralized;