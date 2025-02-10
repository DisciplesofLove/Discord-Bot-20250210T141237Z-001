// Command performance enhancements
const { Performance } = require('perf_hooks');

class CommandPerformance {
    constructor() {
        this.metrics = new Map();
    }

    // Start tracking command execution time
    startTracking(commandName, userId) {
        const key = `${commandName}-${userId}`;
        this.metrics.set(key, {
            startTime: Performance.now(),
            memory: process.memoryUsage()
        });
    }

    // End tracking and return performance metrics
    endTracking(commandName, userId) {
        const key = `${commandName}-${userId}`;
        const start = this.metrics.get(key);
        
        if (!start) return null;

        const endTime = Performance.now();
        const endMemory = process.memoryUsage();

        const metrics = {
            executionTime: endTime - start.startTime,
            memoryDelta: {
                heapUsed: endMemory.heapUsed - start.memory.heapUsed,
                external: endMemory.external - start.memory.external,
                rss: endMemory.rss - start.memory.rss
            }
        };

        this.metrics.delete(key);
        return metrics;
    }

    // Get average performance metrics for a command
    getAverageMetrics(commandName) {
        // Implementation for calculating average performance metrics
        // This could be used for monitoring and optimization
    }
}

// Rate limiting utility
class RateLimiter {
    constructor(maxRequests, timeWindow) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.requests = new Map();
    }

    isRateLimited(userId) {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];
        
        // Remove expired requests
        const validRequests = userRequests.filter(
            time => time > now - this.timeWindow
        );
        
        if (validRequests.length >= this.maxRequests) {
            return true;
        }
        
        validRequests.push(now);
        this.requests.set(userId, validRequests);
        return false;
    }
}

module.exports = {
    CommandPerformance,
    RateLimiter
};