const OrbitDB = require('orbit-db');
const IPFS = require('ipfs');
const orbitConfig = require('../../config/orbitdb');

class StorageService {
    constructor() {
        this.ipfs = null;
        this.orbitdb = null;
        this.stores = {};
    }

    async initialize() {
        // Create IPFS instance
        this.ipfs = await IPFS.create();
        
        // Create OrbitDB instance
        this.orbitdb = await OrbitDB.createInstance(this.ipfs);

        // Create databases
        for (const [name, type] of Object.entries(orbitConfig.databases)) {
            this.stores[name] = await this.orbitdb.open(name, {
                type,
                create: true,
                overwrite: false
            });
            await this.stores[name].load();
        }
    }

    async get(storeName, key) {
        return await this.stores[storeName].get(key);
    }

    async put(storeName, key, value) {
        return await this.stores[storeName].put(key, value);
    }

    async close() {
        for (const store of Object.values(this.stores)) {
            await store.close();
        }
        await this.orbitdb.stop();
        await this.ipfs.stop();
    }
}

module.exports = new StorageService();