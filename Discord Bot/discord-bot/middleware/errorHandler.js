const logger = require('../utils/logger');
const { Sentry } = require('../scripts/setup/setup-monitoring');

class BotError extends Error {
    constructor(message, code, originalError = null) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.originalError = originalError;
    }
}

const errorTypes = {
    COMMAND_FAILED: 'COMMAND_FAILED',
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    CONTRACT_ERROR: 'CONTRACT_ERROR',
    P2P_ERROR: 'P2P_ERROR',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
};

const errorHandler = async (error, interaction) => {
    try {
        // Capture error with Sentry
        Sentry.captureException(error);

        // Log the error
        logger.error('Error occurred:', {
            error: error.message,
            code: error.code,
            commandName: interaction?.commandName,
            userId: interaction?.user?.id,
            guildId: interaction?.guildId
        });

        // Default error message
        let responseMessage = 'An unexpected error occurred. Please try again later.';
        let ephemeral = true;

        // Customize response based on error type
        switch (error.code) {
            case errorTypes.VALIDATION_FAILED:
                responseMessage = `Validation error: ${error.message}`;
                break;
            case errorTypes.PERMISSION_DENIED:
                responseMessage = 'You do not have permission to use this command.';
                break;
            case errorTypes.RATE_LIMIT_EXCEEDED:
                responseMessage = 'You are sending commands too quickly. Please slow down.';
                break;
            case errorTypes.CONTRACT_ERROR:
                responseMessage = 'There was an error processing the blockchain transaction.';
                break;
            case errorTypes.P2P_ERROR:
                responseMessage = 'There was an error with the P2P network operation.';
                break;
        }

        // Send error response if interaction exists and can be replied to
        if (interaction && !interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: responseMessage,
                ephemeral: ephemeral
            });
        } else if (interaction && interaction.deferred) {
            await interaction.editReply({
                content: responseMessage
            });
        }

        // Additional error handling logic
        if (error.code === errorTypes.P2P_ERROR) {
            // Attempt to reconnect to P2P network
            await require('../utils/p2p-manager').reconnect();
        }

        // Log error recovery attempts
        logger.info('Error recovery completed', {
            errorCode: error.code,
            handled: true
        });
    } catch (handlingError) {
        // Log error handler failures
        logger.error('Error handler failed:', handlingError);
        Sentry.captureException(handlingError);
    }
};

module.exports = {
    errorHandler,
    errorTypes,
    BotError
};