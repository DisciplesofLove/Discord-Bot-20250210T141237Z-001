// Decentralized monitoring configuration
const MONITORING_CONFIG = {
    // Use LibP2P for peer discovery and metrics sharing
    p2p: {
        enabled: true,
        port: 9090,
        bootstrap: [
            '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ'
        ]
    },
    // Store metrics in OrbitDB
    storage: {
        type: 'orbit-db',
        database: 'metrics'
    },
    // Collect metrics every 60 seconds
    interval: 60000
};

module.exports = MONITORING_CONFIG;