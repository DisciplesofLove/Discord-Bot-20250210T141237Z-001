module.exports = {
    node: process.env.IOTA_NODE || 'https://api.lb-0.h.chrysalis-devnet.iota.cafe',
    ipfs: {
        host: process.env.IPFS_HOST || 'ipfs.infura.io',
        port: process.env.IPFS_PORT || 5001,
        protocol: process.env.IPFS_PROTOCOL || 'https'
    }
};