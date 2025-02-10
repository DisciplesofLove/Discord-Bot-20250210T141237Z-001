const axios = require('axios');
const Redis = require('ioredis');
const { Client } = require('@elastic/elasticsearch');
const amqp = require('amqplib');
const logger = require('./logger');

class HealthChecker {
    constructor() {
        this.redis = new Redis(process.env.REDIS_URL);
        this.elasticsearch = new Client({ node: process.env.ELASTICSEARCH_URL });
    }

    async checkRedis() {
        try {
            await this.redis.ping();
            return { status: 'healthy' };
        } catch (error) {
            logger.error('Redis health check failed:', error);
            return { status: 'unhealthy', error: error.message };
        }
    }

    async checkElasticsearch() {
        try {
            const health = await this.elasticsearch.cluster.health();
            return { 
                status: health.status === 'green' ? 'healthy' : 'degraded',
                details: health 
            };
        } catch (error) {
            logger.error('Elasticsearch health check failed:', error);
            return { status: 'unhealthy', error: error.message };
        }
    }

    async checkRabbitMQ() {
        try {
            const connection = await amqp.connect(process.env.RABBITMQ_URL);
            await connection.close();
            return { status: 'healthy' };
        } catch (error) {
            logger.error('RabbitMQ health check failed:', error);
            return { status: 'unhealthy', error: error.message };
        }
    }

    async checkExternalAPI(url) {
        try {
            const response = await axios.get(url);
            return { 
                status: response.status === 200 ? 'healthy' : 'degraded',
                responseTime: response.duration
            };
        } catch (error) {
            logger.error(`External API health check failed for ${url}:`, error);
            return { status: 'unhealthy', error: error.message };
        }
    }
}

module.exports = new HealthChecker();