// Command handler optimizations
const { Collection } = require('discord.js');

// Optimization: Add command aliases support
class OptimizedCommandHandler {
    constructor() {
        this.commands = new Collection();
        this.aliases = new Collection();
        this.cooldowns = new Collection();
    }

    // Add command with optional aliases
    registerCommand(command) {
        this.commands.set(command.name, command);
        
        // Register aliases if present
        if (command.aliases && Array.isArray(command.aliases)) {
            command.aliases.forEach(alias => {
                this.aliases.set(alias, command.name);
            });
        }
    }

    // Enhanced command lookup with alias support
    findCommand(name) {
        return this.commands.get(name) 
            || this.commands.get(this.aliases.get(name));
    }

    // Improved cooldown handling with user-specific tracking
    handleCooldown(command, userId) {
        if (!this.cooldowns.has(command.name)) {
            this.cooldowns.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = this.cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(userId)) {
            const expirationTime = timestamps.get(userId) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return Math.round(timeLeft);
            }
        }

        timestamps.set(userId, now);
        setTimeout(() => timestamps.delete(userId), cooldownAmount);
        return 0;
    }

    // Add command usage analytics
    trackCommandUsage(command, userId) {
        // Implementation for tracking command usage metrics
        // This could integrate with a monitoring system
        if (!command.usageCount) command.usageCount = 0;
        command.usageCount++;
        
        // You could emit events or log to an external system here
        console.log(`Command ${command.name} used by ${userId}. Total uses: ${command.usageCount}`);
    }
}

module.exports = OptimizedCommandHandler;