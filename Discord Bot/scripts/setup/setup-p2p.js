const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');
const MonitoringService = require('../../backend/src/services/core/monitoring.service');
const StorageService = require('../../backend/src/services/core/storage.service');
const CacheService = require('../../backend/src/services/core/cache.service');

async function setupP2PInfrastructure() {
    console.log('Initializing P2P infrastructure...');
    
    try {
        // Initialize storage service
        await StorageService.initialize();
        console.log('Storage service initialized');
        
        // Initialize cache service
        await CacheService.initialize();
        console.log('Cache service initialized');
        
        // Initialize monitoring
        await MonitoringService.initialize();
        console.log('Monitoring service initialized');
        
        console.log('P2P infrastructure setup completed successfully');
    } catch (error) {
        console.error('Failed to setup P2P infrastructure:', error);
        throw error;
    }
}

if (require.main === module) {
    setupP2PInfrastructure().catch(console.error);
}

module.exports = setupP2PInfrastructure;