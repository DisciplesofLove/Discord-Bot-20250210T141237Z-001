const logger = require('../utils/logger');

const PermissionLevel = {
    USER: 0,
    MODERATOR: 1,
    ADMIN: 2,
    OWNER: 3
};

class PermissionManager {
    constructor() {
        this.rolePermissions = new Map();
    }

    initialize() {
        // Default role mappings
        this.rolePermissions.set('everyone', PermissionLevel.USER);
        this.rolePermissions.set('moderator', PermissionLevel.MODERATOR);
        this.rolePermissions.set('admin', PermissionLevel.ADMIN);
        this.rolePermissions.set('owner', PermissionLevel.OWNER);
    }

    setRolePermission(roleName, permissionLevel) {
        this.rolePermissions.set(roleName.toLowerCase(), permissionLevel);
    }

    getUserPermissionLevel(member) {
        let highestPermission = PermissionLevel.USER;

        // Check each role the user has
        member.roles.cache.forEach(role => {
            const rolePermission = this.rolePermissions.get(role.name.toLowerCase());
            if (rolePermission !== undefined && rolePermission > highestPermission) {
                highestPermission = rolePermission;
            }
        });

        return highestPermission;
    }

    checkPermission(member, requiredLevel) {
        const userLevel = this.getUserPermissionLevel(member);
        return userLevel >= requiredLevel;
    }
}

const permissionMiddleware = (requiredLevel) => {
    return (interaction, next) => {
        try {
            const hasPermission = permissionManager.checkPermission(interaction.member, requiredLevel);
            
            if (!hasPermission) {
                logger.warn(`Permission denied for user ${interaction.user.id} on command ${interaction.commandName}`);
                return interaction.reply({ 
                    content: 'You do not have permission to use this command.',
                    ephemeral: true 
                });
            }
            
            return next();
        } catch (error) {
            logger.error('Permission check failed:', error);
            return interaction.reply({ 
                content: 'An error occurred while checking permissions.',
                ephemeral: true 
            });
        }
    };
};

const permissionManager = new PermissionManager();
permissionManager.initialize();

module.exports = {
    PermissionLevel,
    permissionManager,
    permissionMiddleware
};