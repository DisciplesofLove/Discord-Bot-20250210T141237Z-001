const axios = require('axios');
const { HealthChecker } = require('./monitoring/health-checks');
const logger = require('./monitoring/logger');

async function performHealthCheck() {
    try {
        const healthChecker = new HealthChecker();
        const checks = await Promise.all([
            healthChecker.checkRedis(),
            healthChecker.checkElasticsearch(),
            healthChecker.checkRabbitMQ()
        ]);

        const unhealthy = checks.filter(check => check.status === 'unhealthy');
        if (unhealthy.length > 0) {
            logger.error('Health check failed:', unhealthy);
            process.exit(1);
        }

        logger.info('Health check passed');
        process.exit(0);
    } catch (error) {
        logger.error('Health check error:', error);
        process.exit(1);
    }
}

performHealthCheck();