// GunDB Configuration for distributed caching
const CACHE_CONFIG = {
    peers: [
        'http://localhost:8765/gun', // Local peer
        'https://gun-manhattan.herokuapp.com/gun' // Public relay peer
    ],
    options: {
        radisk: true, // Persist data to disk
        file: 'cache-data',
        web: 8765 // Port for GunDB server
    }
};

module.exports = CACHE_CONFIG;