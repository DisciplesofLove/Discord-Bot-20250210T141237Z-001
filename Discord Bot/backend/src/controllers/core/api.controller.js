const AIService = require('../../services/core/ai.service');
const BlockchainService = require('../../services/core/blockchain.service');

class APIController {
    constructor() {
        this.aiService = new AIService();
        this.blockchainService = new BlockchainService();
    }

    async trainModel(req, res) {
        try {
            const { modelConfig, trainingData } = req.body;
            const userId = req.user.id;

            const result = await this.aiService.trainModel(modelConfig, trainingData, userId);
            res.json(result);
        } catch (error) {
            console.error('Training error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getTrainingStatus(req, res) {
        try {
            const { jobId } = req.params;
            const status = await this.aiService.computeService.getJobStatus(jobId);
            res.json(status);
        } catch (error) {
            console.error('Status check error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getTrainingResults(req, res) {
        try {
            const { jobId } = req.params;
            const results = await this.aiService.computeService.getJobResults(jobId);
            res.json(results);
        } catch (error) {
            console.error('Results fetch error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async processCommand(req, res) {
        try {
            const { command } = req.body;
            const context = { userId: req.user.id };

            const result = await this.aiService.processNaturalLanguageCommand(command, context);
            res.json(result);
        } catch (error) {
            console.error('Command processing error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async verifyMetadata(req, res) {
        try {
            const { hash } = req.params;
            const isValid = await this.blockchainService.verifyMetadata(hash);
            res.json({ valid: isValid });
        } catch (error) {
            console.error('Verification error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getTransactionHistory(req, res) {
        try {
            const { userId } = req.params;
            const history = await this.blockchainService.getTransactionHistory(userId);
            res.json(history);
        } catch (error) {
            console.error('History fetch error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getSystemStatus(req, res) {
        try {
            const computeStatus = await this.aiService.computeService.getSystemStatus();
            const blockchainStatus = await this.blockchainService.contract.methods.isOperational().call();
            
            res.json({
                status: 'operational',
                compute: computeStatus,
                blockchain: blockchainStatus
            });
        } catch (error) {
            console.error('System status error:', error);
            res.status(500).json({ error: error.message });
        }
    }