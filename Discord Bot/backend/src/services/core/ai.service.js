// AI service implementation
const DecentralizedComputeService = require('./decentralized-compute.service');
const BlockchainService = require('./blockchain.service');
const FederatedLearning = require('../training/federated-learning.service');
const DeepSeekNLP = require('../nlp/deepseek.service');
const { iota } = require('../../config/blockchain');

class AIService {
    constructor() {
        this.computeService = new DecentralizedComputeService();
        this.blockchainService = new BlockchainService();
        this.federatedLearning = new FederatedLearning();
        this.nlpService = new DeepSeekNLP();
    }

    async trainModel(modelConfig, trainingData, userId) {
        try {
            // Validate the request
            await this.validateTrainingRequest(modelConfig, userId);

            // Initialize compute job
            const computeJob = await this.computeService.initializeJob({
                type: 'TRAIN_MODEL',
                config: modelConfig,
                data: trainingData
            });

            // Record training metadata on blockchain
            await this.recordTrainingMetadata(computeJob, userId);

            // Start the training job
            const result = await this.computeService.executeJob(computeJob.id);

            // Update model in registry with new weights
            if (result.weights) {
                await this.federatedLearning.updateModelWeights(
                    modelConfig.modelId,
                    result.weights
                );
            }

            return {
                success: true,
                jobId: computeJob.id,
                status: 'completed',
                metrics: result.metrics
            };
        } catch (error) {
            console.error('Training error:', error);
            throw error;
        }
        // Validate user permissions and data
        await this.validateTrainingRequest(modelConfig, userId);
        
        // Initialize federated learning session
        const federatedSession = await this.federatedLearning.initializeSession(modelConfig);
        
        // Distribute computation across decentralized network
        const computeJob = await this.computeService.distributeComputation(modelConfig, trainingData);
        
        // Record training metadata on IOTA
        const metadata = await this.recordTrainingMetadata(computeJob, userId);
        
        return {
            jobId: computeJob.id,
            federatedSessionId: federatedSession.id,
            metadataHash: metadata.hash
        };
    }

    async validateTrainingRequest(config, userId) {
        try {
            // Validate model configuration
            if (!config.modelId || !config.hyperparameters) {
                throw new Error('Invalid model configuration');
            }

            // Check user permissions and resource allocation
            const userPermissions = await this.computeService.checkUserPermissions(userId);
            if (!userPermissions.canTrain) {
                throw new Error('User does not have permission to train models');
            }

            // Verify resource availability
            const resources = await this.computeService.checkResourceAvailability(config);
            if (!resources.available) {
                throw new Error('Insufficient computing resources');
            }

            return true;
        } catch (error) {
            console.error('Validation error:', error);
            throw error;
        }
    }

    async recordTrainingMetadata(computeJob, userId) {
        const metadata = {
            timestamp: Date.now(),
            userId,
            computeJobId: computeJob.id,
            provider: computeJob.provider,
            modelConfig: computeJob.config,
            status: 'started'
        };
        
        return this.blockchainService.recordMetadata(metadata);
    }

    async processNaturalLanguageCommand(command, context) {
        try {
            // Parse the command using NLP service
            const parsedCommand = await this.nlpService.parseCommand(command);

            // Execute the parsed command
            const result = await this.executeCommand(parsedCommand, context);

            return {
                success: true,
                result: result,
                command: parsedCommand
            };
        } catch (error) {
            console.error('Error processing natural language command:', error);
            throw new Error('Failed to process command');
        }
    }

    async executeCommand(parsedCommand, context) {
        switch (parsedCommand.type) {
            case 'TRAIN_MODEL':
                return this.trainModel(
                    parsedCommand.modelConfig,
                    parsedCommand.trainingData,
                    context.userId
                );
            case 'CHECK_STATUS':
                return this.computeService.getJobStatus(parsedCommand.jobId);
            case 'GET_RESULTS':
                return this.computeService.getJobResults(parsedCommand.jobId);
            default:
                throw new Error('Unsupported command type');
        }
    }
}

module.exports = AIService;