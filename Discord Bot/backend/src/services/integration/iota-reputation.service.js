const { ClientBuilder } = require('@iota/client');
const { create } = require('ipfs-http-client');
const config = require('../../config');

class IOTAReputationService {
    constructor() {
        this.client = new ClientBuilder()
            .node(config.iota.node)
            .build();
        
        this.ipfs = create({
            host: config.ipfs.host,
            port: config.ipfs.port,
            protocol: config.ipfs.protocol
        });
    }

    async storeReputationData(userId, action, points, type) {
        try {
            // Create reputation data object
            const reputationData = {
                userId,
                action,
                points,
                type,
                timestamp: Date.now()
            };

            // Store data in IPFS
            const ipfsResult = await this.ipfs.add(JSON.stringify(reputationData));
            
            // Create IOTA message with IPFS hash
            const message = {
                type: 'reputation_update',
                ipfsHash: ipfsResult.path,
                timestamp: Date.now()
            };

            // Send message to IOTA Tangle
            const messageId = await this.client.message()
                .index('reputation')
                .data(Buffer.from(JSON.stringify(message)))
                .submit();

            return {
                success: true,
                messageId,
                ipfsHash: ipfsResult.path
            };
        } catch (error) {
            console.error('Error storing reputation data:', error);
            throw error;
        }
    }

    async getReputationHistory(userId) {
        try {
            const messages = await this.client.message()
                .index('reputation')
                .fetch();

            const history = [];
            
            for (const message of messages) {
                const data = JSON.parse(message.data.toString());
                if (data.type === 'reputation_update') {
                    const ipfsData = await this.ipfs.cat(data.ipfsHash);
                    const reputationData = JSON.parse(ipfsData.toString());
                    
                    if (reputationData.userId === userId) {
                        history.push({
                            ...reputationData,
                            messageId: message.messageId,
                            ipfsHash: data.ipfsHash
                        });
                    }
                }
            }

            return {
                success: true,
                history: history.sort((a, b) => b.timestamp - a.timestamp)
            };
        } catch (error) {
            console.error('Error fetching reputation history:', error);
            throw error;
        }
    }

    async verifyReputationData(messageId) {
        try {
            const message = await this.client.getMessage(messageId);
            if (!message) {
                throw new Error('Message not found');
            }

            const data = JSON.parse(message.data.toString());
            const ipfsData = await this.ipfs.cat(data.ipfsHash);
            const reputationData = JSON.parse(ipfsData.toString());

            return {
                success: true,
                verified: true,
                data: reputationData
            };
        } catch (error) {
            console.error('Error verifying reputation data:', error);
            throw error;
        }
    }

    async syncReputationState(userId) {
        try {
            const { history } = await this.getReputationHistory(userId);
            
            let totalLove = 0;
            let totalVice = 0;

            for (const record of history) {
                if (record.type === 'LOVE') {
                    totalLove += record.points;
                } else if (record.type === 'VICE') {
                    totalVice += record.points;
                }
            }

            return {
                success: true,
                loveScore: totalLove,
                viceScore: totalVice,
                recordCount: history.length
            };
        } catch (error) {
            console.error('Error syncing reputation state:', error);
            throw error;
        }
    }
}

module.exports = new IOTAReputationService();