// IOTA Network Configuration
const IOTA_CONFIG = {
    network: 'mainnet', // or 'devnet' for testing
    node: 'https://chrysalis-nodes.iota.org:443', // IOTA node URL
    localPowEnabled: true, // Enable local Proof of Work
    mwm: 14, // Minimum Weight Magnitude for mainnet
};

module.exports = IOTA_CONFIG;