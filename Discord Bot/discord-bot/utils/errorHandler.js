const logger = require('../../monitoring/logger');

class ErrorHandler {
    static async handle(error, interaction) {
        logger.error('Discord bot error:', {
            error: error.message,
            stack: error.stack,
            command: interaction?.commandName,
            user: interaction?.user?.id,
            guild: interaction?.guildId
        });

        // Determine error type and appropriate response
        let userMessage;
        if (error.code === 'RATE_LIMITED') {
            userMessage = 'You are sending commands too quickly. Please wait a moment and try again.';
        } else if (error.code === 'CIRCUIT_OPEN') {
            userMessage = 'This service is temporarily unavailable. Please try again later.';
        } else if (error.code === 'PERMISSION_DENIED') {
            userMessage = 'You do not have permission to use this command.';
        } else {
            userMessage = 'An unexpected error occurred. Please try again later.';
        }

        // Respond to the user if possible
        try {
            if (interaction?.deferred) {
                await interaction.editReply({ content: userMessage, ephemeral: true });
            } else if (interaction?.replied) {
                await interaction.followUp({ content: userMessage, ephemeral: true });
            } else if (interaction) {
                await interaction.reply({ content: userMessage, ephemeral: true });
            }
        } catch (replyError) {
            logger.error('Error while sending error response:', replyError);
        }

        // Report error to monitoring service
        await reportErrorToMonitoring(error);
    }
}

async function reportErrorToMonitoring(error) {
    try {
        // Implementation for your error reporting service (e.g., Sentry)
        if (process.env.SENTRY_DSN) {
            const Sentry = require('@sentry/node');
            Sentry.captureException(error);
        }
    } catch (reportError) {
        logger.error('Error reporting to monitoring service:', reportError);
    }
}

module.exports = ErrorHandler;