const { sanitize } = require('string-sanitizer');
const logger = require('../../monitoring/logger');

class InputValidator {
    static validateStringInput(input, options = {}) {
        const {
            minLength = 1,
            maxLength = 2000,
            allowedCharacters = /^[\w\s.,!?()-]+$/,
            sanitizeInput = true
        } = options;

        if (typeof input !== 'string') {
            throw new ValidationError('Input must be a string');
        }

        let processedInput = input.trim();
        
        if (sanitizeInput) {
            processedInput = sanitize(processedInput);
        }

        if (processedInput.length < minLength) {
            throw new ValidationError(`Input must be at least ${minLength} characters long`);
        }

        if (processedInput.length > maxLength) {
            throw new ValidationError(`Input must not exceed ${maxLength} characters`);
        }

        if (!allowedCharacters.test(processedInput)) {
            throw new ValidationError('Input contains invalid characters');
        }

        return processedInput;
    }

    static validateNumberInput(input, options = {}) {
        const {
            min = Number.MIN_SAFE_INTEGER,
            max = Number.MAX_SAFE_INTEGER,
            allowDecimals = false
        } = options;

        const num = Number(input);

        if (isNaN(num)) {
            throw new ValidationError('Input must be a valid number');
        }

        if (!allowDecimals && !Number.isInteger(num)) {
            throw new ValidationError('Input must be a whole number');
        }

        if (num < min || num > max) {
            throw new ValidationError(`Input must be between ${min} and ${max}`);
        }

        return num;
    }

    static validateCommandOptions(options, schema) {
        const validatedOptions = {};

        for (const [key, value] of Object.entries(options)) {
            if (!schema[key]) {
                logger.warn(`Unknown option received: ${key}`);
                continue;
            }

            try {
                if (schema[key].type === 'string') {
                    validatedOptions[key] = this.validateStringInput(value, schema[key].options);
                } else if (schema[key].type === 'number') {
                    validatedOptions[key] = this.validateNumberInput(value, schema[key].options);
                }
            } catch (error) {
                throw new ValidationError(`Invalid ${key}: ${error.message}`);
            }
        }

        return validatedOptions;
    }
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.code = 'VALIDATION_ERROR';
    }
}

module.exports = {
    InputValidator,
    ValidationError
};