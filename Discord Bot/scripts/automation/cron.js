const cron = require('node-cron');
const logger = require('../../monitoring/logger');
const cache = require('../../discord-bot/utils/cache');
const { HealthChecker } = require('../../monitoring/health-checks');

// Run system health check every 5 minutes
cron.schedule('*/5 * * * *', async () => {
    logger.info('Running scheduled health check');
    try {
        const healthChecker = new HealthChecker();
        const checks = await Promise.all([
            healthChecker.checkRedis(),
            healthChecker.checkElasticsearch(),
            healthChecker.checkRabbitMQ()
        ]);
        
        const unhealthy = checks.filter(check => check.status === 'unhealthy');
        if (unhealthy.length > 0) {
            logger.error('Scheduled health check failed:', unhealthy);
        }
    } catch (error) {
        logger.error('Scheduled health check error:', error);
    }
});

// Clear expired cache entries daily at midnight
cron.schedule('0 0 * * *', async () => {
    logger.info('Running scheduled cache cleanup');
    try {
        await cache.invalidatePattern('expired:*');
        logger.info('Cache cleanup completed');
    } catch (error) {
        logger.error('Cache cleanup error:', error);
    }
});

// Rotate logs weekly on Sunday at 00:00
cron.schedule('0 0 * * 0', async () => {
    logger.info('Running scheduled log rotation');
    try {
        // Implement log rotation logic here
        // This could involve compressing old logs and moving them to cold storage
    } catch (error) {
        logger.error('Log rotation error:', error);
    }
});

// Example of how to use the cache and retry mechanism in commands
async function exampleCachedOperation() {
    const cache = require('../discord-bot/utils/cache');
    const RetryStrategy = require('../discord-bot/utils/retry');
    
    const retry = new RetryStrategy({
        maxAttempts: 3,
        initialDelay: 1000
    });

    const cacheKey = 'example:data';
    
    try {
        // Try to get data from cache first
        let data = await cache.get(cacheKey);
        
        if (!data) {
            // If not in cache, fetch with retry mechanism
            data = await retry.execute(async () => {
                // Fetch data from external API
                const response = await fetch('https://api.example.com/data');
                return response.json();
            });
            
            // Cache the result
            await cache.set(cacheKey, data, 3600);
        }
        
        return data;
    } catch (error) {
        logger.error('Error in cached operation:', error);
        throw error;
    }
}

module.exports = {
    exampleCachedOperation
};