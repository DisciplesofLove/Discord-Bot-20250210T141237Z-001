const { ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

class InputValidator {
    static validateString(value, options = {}) {
        if (typeof value !== 'string') {
            throw new ValidationError('Invalid string input');
        }

        if (options.minLength && value.length < options.minLength) {
            throw new ValidationError(`Input must be at least ${options.minLength} characters long`);
        }

        if (options.maxLength && value.length > options.maxLength) {
            throw new ValidationError(`Input must not exceed ${options.maxLength} characters`);
        }

        if (options.pattern && !options.pattern.test(value)) {
            throw new ValidationError('Input format is invalid');
        }

        return value;
    }

    static validateNumber(value, options = {}) {
        const num = Number(value);
        
        if (isNaN(num)) {
            throw new ValidationError('Invalid number input');
        }

        if (options.min !== undefined && num < options.min) {
            throw new ValidationError(`Number must be at least ${options.min}`);
        }

        if (options.max !== undefined && num > options.max) {
            throw new ValidationError(`Number must not exceed ${options.max}`);
        }

        return num;
    }

    static validateArray(value, options = {}) {
        if (!Array.isArray(value)) {
            throw new ValidationError('Invalid array input');
        }

        if (options.minLength && value.length < options.minLength) {
            throw new ValidationError(`Array must contain at least ${options.minLength} items`);
        }

        if (options.maxLength && value.length > options.maxLength) {
            throw new ValidationError(`Array must not contain more than ${options.maxLength} items`);
        }

        return value;
    }
}

const validateInput = (schema) => {
    return (interaction, next) => {
        try {
            const validatedOptions = {};
            
            for (const [key, validation] of Object.entries(schema)) {
                const value = interaction.options.get(key)?.value;
                
                if (validation.required && value === undefined) {
                    throw new ValidationError(`Missing required field: ${key}`);
                }

                if (value !== undefined) {
                    validatedOptions[key] = validation.validate(value);
                }
            }

            interaction.validatedOptions = validatedOptions;
            return next();
        } catch (error) {
            logger.error('Input validation failed:', error);
            return interaction.reply({ 
                content: `Validation error: ${error.message}`,
                ephemeral: true 
            });
        }
    };
};

module.exports = {
    InputValidator,
    validateInput
};