const Gun = require('gun');
const cacheConfig = require('../backend/src/config/cache');

// Start GunDB relay/server
const server = Gun({
    ...cacheConfig.options,
    web: cacheConfig.options.web
});

console.log(`GunDB server running on port ${cacheConfig.options.web}`);