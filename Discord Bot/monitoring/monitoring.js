const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

async function monitorSystem() {
    const logger = require('./logger');
    logger.info('Starting system monitoring...');
    const timestamp = new Date().toISOString();
    const metrics = {
        timestamp,
        system: {},
        application: {},
        database: {},
        services: {}
    };

    try {
        // System metrics
        metrics.system = {
            cpu: {
                usage: os.loadavg(),
                cores: os.cpus().length
            },
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                used: os.totalmem() - os.freemem()
            },
            uptime: os.uptime(),
            platform: os.platform(),
            hostname: os.hostname()
        };

        // Disk usage
        try {
            const diskUsage = execSync('df -h / | tail -1').toString();
            const [filesystem, size, used, available, percentage, mounted] = diskUsage.split(/\s+/);
            metrics.system.disk = { filesystem, size, used, available, percentage, mounted };
        } catch (error) {
            console.error('Error getting disk usage:', error);
        }

        // Application metrics
        try {
            const response = await fetch(`http://localhost:${process.env.PORT || 3000}/health`);
            metrics.application.status = response.ok ? 'healthy' : 'unhealthy';
            metrics.application.responseTime = response.headers.get('X-Response-Time');
        } catch (error) {
            metrics.application.status = 'unreachable';
            console.error('Error checking application health:', error);
        }

        // Database metrics
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            
            const adminDb = mongoose.connection.db.admin();
            const serverStatus = await adminDb.serverStatus();
            
            metrics.database = {
                status: 'connected',
                connections: serverStatus.connections,
                opCounters: serverStatus.opcounters,
                memoryUsage: serverStatus.mem
            };
        } catch (error) {
            metrics.database.status = 'error';
            console.error('Error checking database status:', error);
        }

        // Service health checks
        const services = ['redis', 'elasticsearch', 'rabbitmq'];
        for (const service of services) {
            try {
                // Add specific health checks for each service
                metrics.services[service] = await checkServiceHealth(service);
            } catch (error) {
                metrics.services[service] = { status: 'error', error: error.message };
            }
        }

        // Write metrics to log file
        const logsDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        const logFile = path.join(logsDir, 'monitoring.log');
        fs.appendFileSync(logFile, JSON.stringify(metrics) + '\n');

        // Check for alert conditions
        checkAlertConditions(metrics);

        console.log('Monitoring completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Monitoring failed:', error);
        process.exit(1);
    }
}

async function checkServiceHealth(service) {
    const healthChecker = require('./health-checks');
    
    switch (service) {
        case 'redis':
            return await healthChecker.checkRedis();
        case 'elasticsearch':
            return await healthChecker.checkElasticsearch();
        case 'rabbitmq':
            return await healthChecker.checkRabbitMQ();
        default:
            logger.warn(`Unknown service health check requested: ${service}`);
            return { status: 'unknown' };
    }
}

function checkAlertConditions(metrics) {
    // CPU usage alert
    if (metrics.system.cpu.usage[0] > 80) {
        sendAlert('High CPU Usage', `CPU usage is at ${metrics.system.cpu.usage[0]}%`);
    }

    // Memory usage alert
    const memoryUsagePercent = (metrics.system.memory.used / metrics.system.memory.total) * 100;
    if (memoryUsagePercent > 90) {
        sendAlert('High Memory Usage', `Memory usage is at ${memoryUsagePercent.toFixed(2)}%`);
    }

    // Disk usage alert
    if (metrics.system.disk && parseInt(metrics.system.disk.percentage) > 90) {
        sendAlert('High Disk Usage', `Disk usage is at ${metrics.system.disk.percentage}`);
    }

    // Application status alert
    if (metrics.application.status !== 'healthy') {
        sendAlert('Application Issue', `Application status is ${metrics.application.status}`);
    }

    // Database status alert
    if (metrics.database.status !== 'connected') {
        sendAlert('Database Issue', `Database status is ${metrics.database.status}`);
    }
}

function sendAlert(title, message) {
    // Implement alert notification logic (e.g., email, Slack, etc.)
    logger.error(`ALERT - ${title}: ${message}`);
    // Send alert to external monitoring service
    sendAlertToMonitoringService(title, message);
    // Add additional alert notification methods here
}

// Execute monitoring
monitorSystem();