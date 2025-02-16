// IOTA Network Configuration
const IOTA_CONFIG = {
    network: 'mainnet',
    node: 'https://chrysalis-nodes.iota.org:443',
    localPowEnabled: true,
    mwm: 14,
    batchSize: 1000, // Number of messages to batch before L2 settlement
    l2Bridge: {
        enabled: true,
        preferredNetwork: 'auto', // 'auto', 'polygon', or 'solana'
        minBatchSize: 100,
        maxBatchSize: 10000,
        batchTimeoutMs: 5000,
        highSpeedMode: {
            enabled: true,
            throughputThreshold: 50, // MB/s
            parallelChannels: 4
        }
    }
};

module.exports = IOTA_CONFIG;