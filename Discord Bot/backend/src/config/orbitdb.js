// OrbitDB Configuration
const ORBITDB_CONFIG = {
    directory: './orbitdb',
    identity: {
        id: 'discord-bot-identity',
    },
    // Define database types for different collections
    databases: {
        users: 'docstore',
        transactions: 'feed',
        settings: 'keyvalue'
    }
};

module.exports = ORBITDB_CONFIG;