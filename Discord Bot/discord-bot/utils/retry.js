const logger = require('../../monitoring/logger');

class RetryStrategy {
    constructor(options = {}) {
        this.maxAttempts = options.maxAttempts || 3;
        this.backoffFactor = options.backoffFactor || 2;
        this.initialDelay = options.initialDelay || 1000;
        this.maxDelay = options.maxDelay || 10000;
        this.retryableErrors = options.retryableErrors || [
            'ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'EPIPE', 
            'NETWORK_ERROR', 'RATE_LIMITED'
        ];
    }

    async execute(operation) {
        let lastError;
        let delay = this.initialDelay;

        for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                if (!this.shouldRetry(error, attempt)) {
                    throw error;
                }

                logger.warn(`Operation failed (attempt ${attempt}/${this.maxAttempts}):`, {
                    error: error.message,
                    nextRetryIn: delay
                });

                await this.sleep(delay);
                delay = Math.min(delay * this.backoffFactor, this.maxDelay);
            }
        }

        throw lastError;
    }

    shouldRetry(error, attempt) {
        return attempt < this.maxAttempts && 
               (this.retryableErrors.includes(error.code) || 
                this.retryableErrors.includes(error.type));
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = RetryStrategy;