const { performance } = require('perf_hooks');

class MetricsService {
    constructor() {
        this.metrics = new Map();
    }

    startTimer(operationId) {
        this.metrics.set(operationId, performance.now());
    }

    endTimer(operationId) {
        const startTime = this.metrics.get(operationId);
        if (!startTime) return 0;
        const duration = performance.now() - startTime;
        this.metrics.delete(operationId);
        return duration;
    }
}

module.exports = new MetricsService();