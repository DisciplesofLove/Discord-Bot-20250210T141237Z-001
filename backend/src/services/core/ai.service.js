const { ethers } = require('ethers');
const { IPFSService } = require('./ipfs.service');
const { BlockchainService } = require('./blockchain.service');
const { AkashService } = require('./akash.service');
const { GolemService } = require('./golem.service');

class AIService {
    constructor() {
        this.ipfsService = new IPFSService();
        this.blockchainService = new BlockchainService();
        this.akashService = new AkashService();
        this.golemService = new GolemService();
    }

    async trainModel({
        datasetHash,
        modelType,
        parameters,
        federatedLearning = false,
        useGolem = false
    }) {
        try {
            // Download and verify dataset
            const datasetPath = await this.ipfsService.downloadDataset(datasetHash);
            
            // Choose compute provider
            const computeService = useGolem ? this.golemService : this.akashService;
            
            // Prepare training environment
            const deploymentId = await computeService.deployTrainingEnvironment({
                model: modelType,
                datasetPath,
                parameters,
                federatedLearning
            });

            // Start training process
            const trainingJob = await this.startTrainingJob(deploymentId, {
                modelType,
                parameters,
                federatedLearning
            });

            // Store model metadata on IPFS
            const modelMetadata = {
                modelType,
                parameters,
                trainingJob: trainingJob.id,
                dateCreated: new Date().toISOString()
            };
            const metadataHash = await this.ipfsService.storeJSON(modelMetadata);

            // Mint NFT for the trained model
            const nftData = await this.blockchainService.mintModelNFT({
                modelMetadataHash: metadataHash,
                creator: trainingJob.creator,
                modelType,
                deploymentId
            });

            return {
                jobId: trainingJob.id,
                deploymentId,
                nftAddress: nftData.address,
                nftTokenId: nftData.tokenId,
                metadataHash
            };
        } catch (error) {
            console.error('AI training error:', error);
            throw new Error(`Failed to train AI model: ${error.message}`);
        }
    }

    async startTrainingJob(deploymentId, config) {
        // Implementation for managing training jobs
        return {
            id: `train_${Date.now()}`,
            status: 'started',
            deploymentId,
            creator: config.creator || 'anonymous',
            config
        };
    }

    async getModelStatus(jobId) {
        // Implementation for checking training status
        return {
            jobId,
            status: 'running',
            progress: 0.5,
            metrics: {}
        };
    }
}

module.exports = { AIService };