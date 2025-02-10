const Redis = require('ioredis');
const logger = require('../../monitoring/logger');

class Cache {
    constructor() {
        this.redis = new Redis(process.env.REDIS_URL);
        this.defaultTTL = 3600; // 1 hour in seconds
    }

    async get(key) {
        try {
            const value = await this.redis.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            logger.error('Cache get error:', error);
            return null;
        }
    }

    async set(key, value, ttl = this.defaultTTL) {
        try {
            await this.redis.setex(key, ttl, JSON.stringify(value));
            return true;
        } catch (error) {
            logger.error('Cache set error:', error);
            return false;
        }
    }

    async delete(key) {
        try {
            await this.redis.del(key);
            return true;
        } catch (error) {
            logger.error('Cache delete error:', error);
            return false;
        }
    }

    async invalidatePattern(pattern) {
        try {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
            return true;
        } catch (error) {
            logger.error('Cache invalidate pattern error:', error);
            return false;
        }
    }
}

module.exports = new Cache();