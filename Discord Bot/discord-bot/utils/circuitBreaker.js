const logger = require('../../monitoring/logger');

class CircuitBreaker {
    constructor(service, options = {}) {
        this.service = service;
        this.threshold = options.threshold || 5;
        this.timeout = options.timeout || 60000; // 60 seconds
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF-OPEN
    }

    async execute(operation) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime >= this.timeout) {
                this.state = 'HALF-OPEN';
            } else {
                throw new Error(`Circuit breaker is OPEN for ${this.service}`);
            }
        }

        try {
            const result = await operation();
            if (this.state === 'HALF-OPEN') {
                this.reset();
            }
            return result;
        } catch (error) {
            this.handleFailure();
            throw error;
        }
    }

    handleFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.failureCount >= this.threshold) {
            this.state = 'OPEN';
            logger.warn(`Circuit breaker opened for ${this.service}`);
        }
    }

    reset() {
        this.failureCount = 0;
        this.state = 'CLOSED';
        this.lastFailureTime = null;
        logger.info(`Circuit breaker reset for ${this.service}`);
    }

    getState() {
        return this.state;
    }
}

module.exports = CircuitBreaker;