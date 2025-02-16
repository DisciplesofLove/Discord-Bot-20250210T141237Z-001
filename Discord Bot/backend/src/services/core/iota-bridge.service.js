const IOTA_CONFIG = require('../../config/iota.js');
const L2Service = require('./l2.service');
const MetricsService = require('./metrics.service');

class IotaBridgeService {
    constructor() {
        this.l2Service = new L2Service();
        this.metrics = MetricsService;
        this.messageQueue = [];
        this.isProcessing = false;
    }

    async queueMessage(message) {
        this.messageQueue.push(message);
        if (this.messageQueue.length >= IOTA_CONFIG.l2Bridge.minBatchSize) {
            await this.processBatch();
        }
    }

    async processBatch() {
        if (this.isProcessing || this.messageQueue.length < IOTA_CONFIG.l2Bridge.minBatchSize) {
            return;
        }

        this.isProcessing = true;
        const operationId = 'iota-l2-bridge-batch';
        this.metrics.startTimer(operationId);

        try {
            const batch = this.messageQueue.splice(0, IOTA_CONFIG.l2Bridge.maxBatchSize);
            const requirements = {
                size: batch.length,
                priority: 'high-throughput'
            };

            // Select optimal L2 network based on current metrics
            const l2Network = await this.l2Service.selectOptimalL2(requirements);
            
            // Process messages in parallel channels for high throughput
            const channels = IOTA_CONFIG.l2Bridge.highSpeedMode.parallelChannels;
            const channelSize = Math.ceil(batch.length / channels);
            
            const channelPromises = Array.from({ length: channels }, (_, i) => {
                const start = i * channelSize;
                const end = Math.min(start + channelSize, batch.length);
                const channelBatch = batch.slice(start, end);
                return this.l2Service.finalizeTransaction(channelBatch, requirements);
            });

            await Promise.all(channelPromises);

            const duration = this.metrics.endTimer(operationId);
            const throughput = (batch.length * 1000) / duration; // messages per second

            if (throughput < IOTA_CONFIG.l2Bridge.highSpeedMode.throughputThreshold) {
                console.warn(`Throughput below threshold: ${throughput} msg/s`);
            }
        } catch (error) {
            console.error('Error processing IOTA-L2 bridge batch:', error);
            // Re-queue failed messages
            this.messageQueue.unshift(...batch);
        } finally {
            this.isProcessing = false;
        }
    }

    async monitorThroughput() {
        const metrics = await this.l2Service.getNetworkMetrics();
        return {
            polygon: metrics.polygon.throughput,
            solana: metrics.solana.throughput,
            messageQueueSize: this.messageQueue.length
        };
    }
}

module.exports = new IotaBridgeService();