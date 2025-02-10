const { Client, GatewayIntentBits } = require('discord.js');
const AIService = require('./backend/src/services/core/ai.service');
const MarketplaceService = require('./backend/src/services/marketplace/marketplace.service');
const NFTService = require('./backend/src/services/marketplace/nft.service');
const CommandHandler = require('./commands');
const path = require('path');
require('dotenv').config();

class AIDiscordBot {
    constructor() {
        this.commandHandler = new CommandHandler();
        this.platformService = new PlatformService();
        this.aiService = new AIService();
        this.marketplaceService = new MarketplaceService();
        this.nftService = new NFTService();
        this.daoService = new DAOService();
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });
    }

    async initialize() {
        // Load commands
        await this.loadCommands();
        
        // Set up event handlers
        this.setupEventHandlers();
        
        // Login
        await this.client.login(process.env.DISCORD_TOKEN);
    }

    async loadCommands() {
        const commandFiles = [
            path.join(__dirname, 'commands', 'help.js'),
            path.join(__dirname, 'commands', 'ping.js'),
            path.join(__dirname, 'commands', 'echo.js')
        ];

        for (const file of commandFiles) {
            const command = require(file);
            this.commandHandler.registerCommand(command);
        }
    }

    setupEventHandlers() {
        this.client.once('ready', () => {
            console.log('AI Discord Bot is ready!');
            console.log(`Loaded ${this.commandHandler.commands.size} commands`);
        });

        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;
            try {
                await this.commandHandler.processMessage(message);
            } catch (error) {
                console.error('Error processing message:', error);
                message.reply('Sorry, I encountered an error while processing your message.');
            }
        });
    }
}

module.exports = AIDiscordBot;