const Redis = require('ioredis');
const logger = require('../../monitoring/logger');

class RateLimiter {
    constructor() {
        this.redis = new Redis(process.env.REDIS_URL);
        this.defaultLimit = 5; // requests
        this.defaultWindow = 60; // seconds
    }

    async isRateLimited(userId, command, limit = this.defaultLimit, window = this.defaultWindow) {
        const key = `ratelimit:${command}:${userId}`;
        try {
            const count = await this.redis.incr(key);
            if (count === 1) {
                await this.redis.expire(key, window);
            }
            return count > limit;
        } catch (error) {
            logger.error('Rate limiter error:', error);
            return false; // Fail open in case of Redis errors
        }
    }

    async getRemainingRequests(userId, command) {
        const key = `ratelimit:${command}:${userId}`;
        try {
            const count = await this.redis.get(key) || 0;
            return Math.max(0, this.defaultLimit - count);
        } catch (error) {
            logger.error('Error getting remaining requests:', error);
            return 0;
        }
    }
}

module.exports = new RateLimiter();