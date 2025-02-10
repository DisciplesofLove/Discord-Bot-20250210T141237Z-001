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
}

module.exports = { IotaService };