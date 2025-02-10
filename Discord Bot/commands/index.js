const { Collection } = require('discord.js');
const { OpenAI } = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

class CommandHandler {
    constructor() {
        this.commands = new Collection();
        this.cooldowns = new Collection();
    }

    // Register a new command
    registerCommand(command) {
        this.commands.set(command.name, command);
    }

    // Process message with NLP
    async processMessage(message) {
        if (message.author.bot) return;

        try {
            // Use OpenAI to understand the intent
            const completion = await openai.chat.completions.create({
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
                model: "gpt-3.5-turbo",
            });

            const intent = completion.choices[0].message.content;

            // Match intent to command
            const command = this.findMatchingCommand(intent);
            if (command) {
                await this.executeCommand(command, message);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    }

    // Find matching command based on intent
    findMatchingCommand(intent) {
        return this.commands.find(cmd => {
            if (cmd.aliases) {
                return cmd.aliases.some(alias => 
                    intent.toLowerCase().includes(alias.toLowerCase())
                );
            }
            return intent.toLowerCase().includes(cmd.name.toLowerCase());
        });
    }

    // Execute a command
    async executeCommand(command, message) {
        // Check if command is on cooldown
        if (!this.checkCooldown(command, message)) {
            return;
        }

        try {
            await command.execute(message);
        } catch (error) {
            console.error(`Error executing command ${command.name}:`, error);
            message.reply('There was an error executing that command.');
        }
    }

    // Cooldown check
    checkCooldown(command, message) {
        if (!this.cooldowns.has(command.name)) {
            this.cooldowns.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = this.cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                message.reply(
                    `Please wait ${timeLeft.toFixed(1)} more second(s) before using the \`${command.name}\` command.`
                );
                return false;
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        return true;
    }
}

module.exports = CommandHandler;