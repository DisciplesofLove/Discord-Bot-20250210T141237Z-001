const EnvironmentManager = require('../utils/envManager');

async function encryptEnvironment() {
    try {
        const envManager = new EnvironmentManager();
        await envManager.encryptEnvironmentFile();
        console.log('Environment variables encrypted successfully');
    } catch (error) {
        console.error('Error encrypting environment:', error);
        process.exit(1);
    }
}

encryptEnvironment();
