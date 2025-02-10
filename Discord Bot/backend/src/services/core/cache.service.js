const Gun = require('gun');
const cacheConfig = require('../../config/cache');

class CacheService {
    constructor() {
        this.gun = null;
    }

    initialize() {
        this.gun = Gun({
            ...cacheConfig.options,
            peers: cacheConfig.peers
        });
    }

    async set(key, value, expireIn = 3600) {
        return new Promise((resolve) => {
            this.gun.get(key).put({
                value,
                expires: Date.now() + (expireIn * 1000)
            }, ack => resolve(ack));
        });
    }

    async get(key) {
        return new Promise((resolve) => {
            this.gun.get(key).once((data) => {
                if (!data) return resolve(null);
                if (data.expires < Date.now()) {
                    this.gun.get(key).put(null);
                    return resolve(null);
                }
                resolve(data.value);
            });
        });
    }

    async delete(key) {
        return new Promise((resolve) => {
            this.gun.get(key).put(null, ack => resolve(ack));
        });
    }
}

module.exports = new CacheService();