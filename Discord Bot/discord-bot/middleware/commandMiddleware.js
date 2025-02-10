const rateLimiter = require('../utils/rateLimiter');
const ErrorHandler = require('../utils/errorHandler');
const logger = require('../../monitoring/logger');

async function commandMiddleware(interaction) {
    if (!interaction.isCommand()) return;

    const commandName = interaction.commandName;
    const userId = interaction.user.id;

    try {
        // Check rate limiting
        const isLimited = await rateLimiter.isRateLimited(userId, commandName);
        if (isLimited) {
            throw Object.assign(new Error('Rate limit exceeded'), { code: 'RATE_LIMITED' });
        }

        // Log command usage
        logger.info('Command executed', {
            command: commandName,
            user: userId,
            guild: interaction.guildId,
            channel: interaction.channelId
        });

        // Check permissions
        if (!await hasPermission(interaction)) {
            throw Object.assign(new Error('Permission denied'), { code: 'PERMISSION_DENIED' });
        }

    } catch (error) {
        await ErrorHandler.handle(error, interaction);
        return false;
    }

    return true;
}

async function hasPermission(interaction) {
    // Implement your permission checking logic here
    return true; // Default to allowing all commands
}

module.exports = commandMiddleware;