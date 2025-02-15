const { ClientBuilder } = require('@iota/client');

class IotaService {
    constructor() {
        this.client = new ClientBuilder()
            .node(process.env.IOTA_NODE_URL)
            .build();
    }

    async createLeaseTransaction({ modelId, lessee, duration }) {
        try {
            const transaction = await this.client.message()
                .with.data({
                    type: 'model_lease',
                    modelId,
                    lessee,
                    duration,
                    timestamp: Date.now()
                })
                .submit();

            return {
                id: transaction.messageId,
                status: 'confirmed'
            };
        } catch (error) {
            console.error('IOTA transaction error:', error);
            throw new Error(`Failed to create IOTA transaction: ${error.message}`);
        }
    }

    async recordAIComputation(computation) {
        try {
            // Record AI computation result on IOTA tangle
            const message = await this.client.message()
                .with.data({
                    type: 'ai_computation',
                    ...computation,
                    timestamp: Date.now()
                })
                .submit();

            return {
                messageId: message.messageId,
                timestamp: message.timestamp
            };
        } catch (error) {
            console.error('Failed to record AI computation:', error);
            throw error;
        }
    }

    async createFeelessTransaction(data) {
        try {
            const message = await this.client.message()
                .with.data(data)
                .with.index('ai_transaction')
                .submit();

            return {
                messageId: message.messageId,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Feeless transaction error:', error);
            throw error;
        }
    }
}

module.exports = { IotaService };