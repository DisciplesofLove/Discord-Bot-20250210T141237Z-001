// Enhanced validation utilities for commands
const { ValidationError } = require('../utils/errors');

class CommandValidator {
    static validatePermissions(member, requiredPermissions) {
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        return requiredPermissions.every(permission => 
            member.permissions.has(permission)
        );
    }

    static validateArguments(args, expectedArgs) {
        if (!expectedArgs) return true;

        return expectedArgs.every((expected, index) => {
            const arg = args[index];
            
            if (expected.required && !arg) {
                throw new ValidationError(`Missing required argument: ${expected.name}`);
            }

            if (arg && expected.type) {
                return this.validateArgumentType(arg, expected.type);
            }

            return true;
        });
    }

    static validateArgumentType(arg, type) {
        switch (type.toLowerCase()) {
            case 'number':
                return !isNaN(parseFloat(arg)) && isFinite(arg);
            case 'boolean':
                return ['true', 'false', '1', '0'].includes(arg.toLowerCase());
            case 'string':
                return typeof arg === 'string';
            default:
                return true;
        }
    }

    static validateChannelType(channel, requiredTypes) {
        if (!requiredTypes || requiredTypes.length === 0) {
            return true;
        }

        return requiredTypes.includes(channel.type);
    }
}

module.exports = CommandValidator;