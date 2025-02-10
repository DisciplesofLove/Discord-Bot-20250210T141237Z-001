const OrbitDB = require('orbit-db');
const Libp2p = require('libp2p');
const TCP = require('libp2p-tcp');
const Mplex = require('libp2p-mplex');
const { NOISE } = require('libp2p-noise');
const monitoringConfig = require('../../config/monitoring');

class MonitoringService {
    constructor() {
        this.node = null;
        this.metricsStore = null;
    }

    async initialize() {
        // Create LibP2P node
        this.node = await Libp2p.create({
            addresses: {
                listen: [`/ip4/0.0.0.0/tcp/${monitoringConfig.p2p.port}`]
            },
            modules: {
                transport: [TCP],
                streamMuxer: [Mplex],
                connEncryption: [NOISE]
            },
            config: {
                peerDiscovery: {
                    bootstrap: {
                        list: monitoringConfig.p2p.bootstrap
                    }
                }
            }
        });

        await this.node.start();

        // Initialize metrics store
        const orbitdb = await OrbitDB.createInstance(this.node);
        this.metricsStore = await orbitdb.log('metrics', {
            accessController: {
                write: ['*'] // Allow all peers to write metrics
            }
        });

        // Start metrics collection
        this.startMetricsCollection();
    }

    async startMetricsCollection() {
        setInterval(async () => {
            const metrics = await this.collectMetrics();
            await this.metricsStore.add(metrics);
        }, monitoringConfig.interval);
    }

    async collectMetrics() {
        const timestamp = Date.now();
        const peers = Array.from(this.node.peerStore.peers.values());
        
        return {
            timestamp,
            metrics: {
                peers: peers.length,
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
                uptime: process.uptime()
            }
        };
    }

    async getMetrics(duration = 3600000) { // Default 1 hour
        const now = Date.now();
        const metrics = await this.metricsStore.iterator({ reverse: true })
            .collect()
            .filter(entry => (now - entry.payload.value.timestamp) <= duration);
        return metrics;
    }

    async close() {
        if (this.metricsStore) {
            await this.metricsStore.close();
        }
        if (this.node) {
            await this.node.stop();
        }
    }
}

module.exports = new MonitoringService();