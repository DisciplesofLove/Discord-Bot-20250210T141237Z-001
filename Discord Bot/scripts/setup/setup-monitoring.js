const winston = require('winston');
const Sentry = require('@sentry/node');
const { createNamespace } = require('cls-hooked');
const prometheusClient = require('prom-client');

// Initialize Sentry
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
});

// Initialize Prometheus metrics
const metrics = {
    commandsProcessed: new prometheusClient.Counter({
        name: 'discord_bot_commands_processed_total',
        help: 'Total number of commands processed'
    }),
    p2pOperations: new prometheusClient.Counter({
        name: 'discord_bot_p2p_operations_total',
        help: 'Total number of P2P operations'
    }),
    responseTime: new prometheusClient.Histogram({
        name: 'discord_bot_response_time_seconds',
        help: 'Response time in seconds',
        buckets: [0.1, 0.5, 1, 2, 5]
    })
};

// Create namespace for request tracking
const namespace = createNamespace('discord-bot');

module.exports = {
    Sentry,
    metrics,
    namespace
};