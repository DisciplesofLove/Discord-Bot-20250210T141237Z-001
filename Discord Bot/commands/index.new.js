const { Collection } = require('discord.js');
const { OpenAI } = require('openai');
const { OptimizedCommandHandler } = require('./core/optimizations');
const { CommandPerformance, RateLimiter } = require('./core/performance');
const { CommandValidator } = require('./core/validation');

class EnhancedCommandHandler extends OptimizedCommandHandler {
    constructor(config) {
        super();
        this.performance = new CommandPerformance();
        this.rateLimiter = new RateLimiter(config.maxRequests || 5, config.timeWindow || 60000);
        this.openai = new OpenAI();
    }

    async processMessage(message) {
        if (message.author.bot) return;

        try {
            // Check rate limiting
            if (this.rateLimiter.isRateLimited(message.author.id)) {
                return message.reply('You are being rate limited. Please wait before sending more commands.');
            }

            // Start performance tracking
            this.performance.startTracking('messageProcess', message.author.id);

            // Use OpenAI to understand the intent
            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that understands user intentions and maps them to bot commands."
                    },
                    {
                        role: "user",
                        content: message.content
                    }
                ],
                model: "gpt-3.5-turbo"
            });

            const intent = completion.choices[0].message.content;
            const command = this.findMatchingCommand(intent);

            if (!command) {
                return message.reply('I could not understand that command.');
            }

            // Validate permissions
            if (!CommandValidator.validatePermissions(message.member, command.permissions)) {
                return message.reply('You do not have permission to use this command.');
            }

            // Handle cooldowns
            const cooldownTime = this.handleCooldown(command, message.author.id);
            if (cooldownTime > 0) {
                return message.reply(`Please wait ${cooldownTime} more seconds before using this command.`);
            }

            // Track command usage
            this.trackCommandUsage(command, message.author.id);

            // Execute command
            await this.executeCommand(command, message);

            // End performance tracking
            const metrics = this.performance.endTracking('messageProcess', message.author.id);
            console.log(`Command execution metrics:`, metrics);

        } catch (error) {
            console.error('Error processing message:', error);
            message.reply('An error occurred while processing your command.');
        }
    }

    findMatchingCommand(intent) {
        return this.findCommand(intent) || this.commands.find(cmd => 
            intent.toLowerCase().includes(cmd.name.toLowerCase())
        );
    }

    async executeCommand(command, message) {
        try {
            await command.execute(message);
        } catch (error) {
            console.error('Error executing command:', error);
            message.reply('There was an error executing that command.');
        }
    }
}

module.exports = EnhancedCommandHandler;