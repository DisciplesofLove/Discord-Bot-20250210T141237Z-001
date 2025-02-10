const { Client } = require('discord.js');
const P2PManager = require('../../discord-bot/utils/p2p-manager');
const ContractManager = require('../../discord-bot/utils/contract-manager');
const logger = require('../../discord-bot/utils/logger');

async function verifyDeployment() {
    try {
        logger.info('Starting deployment verification...');

        // Verify Discord connection
        const client = new Client({ intents: [] });
        await client.login(process.env.DISCORD_TOKEN);
        logger.info('Discord connection verified');
        await client.destroy();

        // Verify P2P components
        await P2PManager.initialize();
        const testData = { test: 'verification' };
        const cid = await P2PManager.storeData(testData);
        const retrieved = await P2PManager.getData(cid);
        if (JSON.stringify(retrieved) !== JSON.stringify(testData)) {
            throw new Error('P2P data verification failed');
        }
        logger.info('P2P components verified');

        // Verify blockchain connection
        await ContractManager.initialize();
        logger.info('Blockchain connection verified');

        // Verify environment
        const requiredEnvVars = [
            'DISCORD_TOKEN',
            'CLIENT_ID',
            'GUILD_ID',
            'WEB3_PROVIDER_URL',
            'IPFS_SWARM_PEERS'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }

        logger.info('Environment configuration verified');
        logger.info('Deployment verification completed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('Deployment verification failed:', error);
        process.exit(1);
    }
}

verifyDeployment();