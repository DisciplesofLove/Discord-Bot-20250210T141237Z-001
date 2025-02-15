const OrbitDB = require('orbit-db');
const IPFS = require('ipfs');

async function initializeOrbitDB() {
    try {
        // Create IPFS instance
        const ipfs = await IPFS.create();

        // Create OrbitDB instance
        const orbitdb = await OrbitDB.createInstance(ipfs);

        // Create databases
        const databases = {
            commands: await orbitdb.log('discord-bot-commands'),
            metrics: await orbitdb.log('discord-bot-metrics'),
            backup: await orbitdb.keyvalue('discord-bot-backup')
        };

        console.log('OrbitDB initialized successfully');
        console.log('Database addresses:');
        Object.entries(databases).forEach(([name, db]) => {
            console.log(`- ${name}: ${db.address}`);
        });

        return databases;
    } catch (error) {
        console.error('Failed to initialize OrbitDB:', error);
        process.exit(1);
    }
}

module.exports = initializeOrbitDB;

if (require.main === module) {
    initializeOrbitDB();
}