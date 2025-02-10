const TelegramBot = require('node-telegram-bot-api');
const { WebClient } = require('@slack/web-api');
const AIService = require('../core/ai.service');
const MarketplaceService = require('../marketplace/marketplace.service');
const DAOService = require('../governance/dao.service');

class PlatformService {
    constructor() {
        this.aiService = new AIService();
        this.marketplaceService = new MarketplaceService();
        this.daoService = new DAOService();
        
        // Initialize platform clients
        this.initializeTelegram();
        this.initializeSlack();
    }

    initializeTelegram() {
        this.telegram = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
        
        this.telegram.on('message', async (msg) => {
            try {
                const response = await this.handlePlatformMessage('telegram', msg);
                this.telegram.sendMessage(msg.chat.id, response);
            } catch (error) {
                console.error('Telegram error:', error);
                this.telegram.sendMessage(msg.chat.id, 'Sorry, an error occurred.');
            }
        });
    }

    initializeSlack() {
        this.slack = new WebClient(process.env.SLACK_TOKEN);
        
        // Setup Slack event handling through API
    }

    async handlePlatformMessage(platform, message) {
        // Process message using NLP
        const command = await this.aiService.processNaturalLanguageCommand(
            message.text,
            { platform, userId: message.from.id }
        );

        return this.executeCommand(command, platform, message);
    }

    async executeCommand(command, platform, context) {
        switch(command.type) {
            case 'TRAIN_MODEL':
                return this.handleTrainModel(command.params, context);
            case 'LIST_MODEL':
                return this.handleListModel(command.params, context);
            case 'VOTE_PROPOSAL':
                return this.handleVoteProposal(command.params, context);
            default:
                return 'Unknown command';
        }
    }

    async handleTrainModel(params, context) {
        const trainingJob = await this.aiService.trainModel(
            params.modelConfig,
            params.trainingData,
            context.userId
        );

        return `Training job started! Job ID: ${trainingJob.jobId}`;
    }

    async handleListModel(params, context) {
        const listing = await this.marketplaceService.listModel(
            params.modelId,
            params.price
        );

        return `Model listed successfully! Listing ID: ${listing.listingId}`;
    }

    async handleVoteProposal(params, context) {
        const vote = await this.daoService.castVote(
            params.proposalId,
            context.userId,
            params.vote,
            params.votingPower
        );

        return `Vote cast successfully! Power: ${vote.votingPower}`;
    }
}

module.exports = PlatformService;