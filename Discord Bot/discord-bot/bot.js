const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const logger = require('./utils/logger');
const p2pManager = require('./utils/p2p-manager');
const contractManager = require('./utils/contract-manager');
const { commandRateLimit } = require('./middleware/rateLimiter');
const { permissionManager, PermissionLevel } = require('./middleware/permissionManager');
const { validateInput } = require('./middleware/inputValidator');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
}

// Graceful shutdown handling
let shuttingDown = false;

process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Starting graceful shutdown...');
    handleGracefulShutdown();
});

process.on('SIGINT', () => {
    logger.info('SIGINT received. Starting graceful shutdown...');
    handleGracefulShutdown();
});

async function handleGracefulShutdown() {
    if (shuttingDown) return;
    shuttingDown = true;

    try {
        logger.info('Stopping new command processing...');
        // Stop accepting new commands but finish processing current ones
        await new Promise(resolve => setTimeout(resolve, 5000));

        logger.info('Destroying client connection...');
        await client.destroy();

        logger.info('Cleanup completed. Exiting process.');
        process.exit(0);
    } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
    }
}

client.once(Events.ClientReady, () => {
    logger.info(`Discord bot ready! Logged in as ${client.user.tag}`);
});

// Initialize logger
const logger = require('../monitoring/logger');
const commandMiddleware = require('./middleware/commandMiddleware');
const ErrorHandler = require('./utils/errorHandler');

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        // Run command through middleware (rate limiting, permissions, etc.)
        const canProceed = await commandMiddleware(interaction);
        if (!canProceed) return;

        // Execute command
        await command.execute(interaction);
    } catch (error) {
        await ErrorHandler.handle(error, interaction);
    }
});

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('Failed to login to Discord:', error);
    process.exit(1);
});