const IOTA = require('@iota/core');
const iotaConfig = require('./iota');

// Blockchain configuration
module.exports = {
    // IOTA client configuration
    iota: new IOTA.composeAPI({
        provider: iotaConfig.node
    }),
    network: iotaConfig.network,
    localPow: iotaConfig.localPowEnabled,
    mwm: iotaConfig.mwm
};