const Libp2p = require('libp2p');
const TCP = require('libp2p-tcp');
const Mplex = require('libp2p-mplex');
const { NOISE } = require('libp2p-noise');
const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');
const Gun = require('gun');

class P2PManager {
    constructor() {
        this.libp2p = null;
        this.ipfs = null;
        this.orbitdb = null;
        this.gun = null;
    }

    async initialize() {
        // Initialize libp2p node
        this.libp2p = await Libp2p.create({
            addresses: {
                listen: ['/ip4/0.0.0.0/tcp/0']
            },
            modules: {
                transport: [TCP],
                streamMuxer: [Mplex],
                connEncryption: [NOISE]
            }
        });

        await this.libp2p.start();
        console.log('Libp2p node started');

        // Initialize IPFS node
        this.ipfs = await IPFS.create();
        console.log('IPFS node started');

        // Initialize OrbitDB
        this.orbitdb = await OrbitDB.createInstance(this.ipfs);
        console.log('OrbitDB instance created');

        // Initialize GUN
        this.gun = Gun({
            peers: process.env.GUN_PEERS ? process.env.GUN_PEERS.split(',') : []
        });
        console.log('GUN instance created');
    }

    async storeData(data) {
        // Store data in IPFS
        const result = await this.ipfs.add(JSON.stringify(data));
        return result.cid.toString();
    }

    async getData(cid) {
        // Retrieve data from IPFS
        const stream = this.ipfs.cat(cid);
        let data = '';
        for await (const chunk of stream) {
            data += chunk.toString();
        }
        return JSON.parse(data);
    }

    async createDatabase(name, type = 'eventlog') {
        // Create OrbitDB database
        return await this.orbitdb.create(name, type);
    }

    async shutdown() {
        // Graceful shutdown of P2P services
        if (this.libp2p) {
            await this.libp2p.stop();
        }
        if (this.ipfs) {
            await this.ipfs.stop();
        }
        if (this.orbitdb) {
            await this.orbitdb.disconnect();
        }
    }
}

module.exports = new P2PManager();