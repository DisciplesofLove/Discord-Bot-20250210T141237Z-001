const logger = require('../../monitoring/logger');
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

// Set up global error handlers
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    reportErrorToMonitoring(error).finally(() => {
        process.exit(1);
    });
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection:', reason);
    reportErrorToMonitoring(reason).finally(() => {
        process.exit(1);
    });
});

// Initialize Sentry if DSN is provided
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        integrations: [
            new ProfilingIntegration()
        ],
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
        beforeSend(event) {
            // Don't send events for known operational errors
            if (event.tags?.errorType === 'operational') {
                return null;
            }
            return event;
        }
    });
}

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
        let errorType = 'operational';  // Default to operational errors

        if (error.code === 'RATE_LIMITED') {
            userMessage = 'You are sending commands too quickly. Please wait a moment and try again.';
        } else if (error.code === 'CIRCUIT_OPEN') {
            userMessage = 'This service is temporarily unavailable. Please try again later.';
        } else if (error.code === 'PERMISSION_DENIED') {
            userMessage = 'You do not have permission to use this command.';
        } else if (error.code === 'NETWORK_ERROR') {
            userMessage = 'Network connectivity issues detected. Please try again later.';
        } else if (error.code === 'API_ERROR') {
            userMessage = 'External service error. Please try again later.';
            errorType = 'external';  // Mark as external service error
        } else {
            userMessage = 'An unexpected error occurred. Please try again later.';
            errorType = 'programming';  // Mark as programming error for non-operational errors
        }
        
        // Add error context
        error.errorType = errorType;

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
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(error);
            await Sentry.flush(2000); // Ensure events are sent before shutdown
        }
    } catch (reportError) {
        logger.error('Error reporting to monitoring service:', reportError);
    }
}

module.exports = {
    ErrorHandler,
    reportErrorToMonitoring
};