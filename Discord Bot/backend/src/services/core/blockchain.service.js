const { Web3 } = require('web3');
const config = require('../../config/blockchain');

class BlockchainService {
    constructor() {
        this.web3 = new Web3(config.provider);
        this.contractAddress = config.contractAddress;
        this.contract = new this.web3.eth.Contract(config.contractABI, this.contractAddress);
    }

    async recordMetadata(metadata) {
        try {
            const hash = await this.generateMetadataHash(metadata);
            const transaction = await this.contract.methods.recordMetadata(hash).send({
                from: config.adminAddress,
                gas: 200000
            });
            return {
                success: true,
                transactionHash: transaction.transactionHash,
                metadataHash: hash
            };
        } catch (error) {
            console.error('Error recording metadata:', error);
            throw new Error('Failed to record metadata on blockchain');
        }
    }

    async generateMetadataHash(metadata) {
        return this.web3.utils.sha3(JSON.stringify(metadata));
    }

    async verifyMetadata(hash) {
        try {
            const isValid = await this.contract.methods.verifyMetadata(hash).call();
            return isValid;
        } catch (error) {
            console.error('Error verifying metadata:', error);
            throw new Error('Failed to verify metadata on blockchain');
        }
    }

    async getTransactionHistory(userId) {
        try {
            const events = await this.contract.getPastEvents('MetadataRecorded', {
                filter: { userId: userId },
                fromBlock: 0,
                toBlock: 'latest'
            });
            return events.map(event => ({
                transactionHash: event.transactionHash,
                metadataHash: event.returnValues.hash,
                timestamp: event.returnValues.timestamp
            }));
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            throw new Error('Failed to fetch transaction history');
        }
    }
}

module.exports = BlockchainService;