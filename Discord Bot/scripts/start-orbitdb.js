const OrbitDB = require('orbit-db');
const IPFS = require('ipfs');

async function startOrbitDB() {
    // Create IPFS instance
    const ipfs = await IPFS.create();
    
    // Create OrbitDB instance
    const orbitdb = await OrbitDB.createInstance(ipfs);
    
    console.log('OrbitDB server started');
    
    // Keep the process running
    process.stdin.resume();
    
    // Handle shutdown
    process.on('SIGINT', async () => {
        console.log('Shutting down OrbitDB...');
        await orbitdb.stop();
        await ipfs.stop();
        process.exit(0);
    });
}

startOrbitDB().catch(console.error);