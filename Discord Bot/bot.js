const { Client, GatewayIntentBits } = require('discord.js');
const AIService = require('./services/core/ai.service');
const MarketplaceService = require('./services/marketplace/marketplace.service');
const NFTService = require('./services/marketplace/nft.service');
const PlatformService = require('./services/core/platform.service');
const DAOService = require('./services/governance/dao.service');
const CommandHandler = require('./commands/command-handler.js');
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
        
        // Make services available to commands
        this.services = {
            ai: this.aiService,
            platform: this.platformService,
            marketplace: this.marketplaceService,
            nft: this.nftService,
            dao: this.daoService
        };
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
        if (!process.env.DISCORD_TOKEN) {
            throw new Error('DISCORD_TOKEN is not set in environment variables');
        }
        try {
            await this.client.login(process.env.DISCORD_TOKEN);
            console.log('Successfully logged in to Discord');
        } catch (error) {
            console.error('Failed to login to Discord:', error);
            throw error;
        }
    }

    async loadCommands() {
        console.log('Loading commands...');
        const commandFiles = [
            path.join(__dirname, 'commands', 'help.js'),
            path.join(__dirname, 'commands', 'ping.js'),
            path.join(__dirname, 'commands', 'echo.js')
        ];

        for (const file of commandFiles) {
            const command = require(file);
            if (command) {
                this.commandHandler.registerCommand(command);
                console.log(`Loaded command: ${command.name}`);
            } else {
                console.error(`Failed to load command from file: ${file}`);
            }
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

// Create and initialize bot instance when this file is run directly
if (require.main === module) {
    const bot = new AIDiscordBot();
    bot.initialize().catch(console.error);
}