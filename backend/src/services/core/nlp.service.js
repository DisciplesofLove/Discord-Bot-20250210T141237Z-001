const { DeepseekAI } = require('@deepseek/sdk');
const { CommandParser } = require('../utils/command-parser');

class NLPService {
    constructor() {
        this.ai = new DeepseekAI({
            apiKey: process.env.DEEPSEEK_API_KEY,
            model: 'deepseek-v4'
        });
        this.parser = new CommandParser();
    }

    async parseNaturalCommand(text) {
        try {
            // Use Deepseek AI to understand natural language intent
            const analysis = await this.ai.analyze(text, {
                task: 'command_understanding',
                context: 'ai_training_bot'
            });

            // Extract command structure
            const command = this.parser.structureCommand({
                intent: analysis.intent,
                parameters: analysis.extractedParams,
                context: analysis.context
            });

            return {
                command: command.name,
                options: command.options,
                confidence: analysis.confidence
            };
        } catch (error) {
            console.error('NLP parsing error:', error);
            throw new Error(`Failed to parse natural language command: ${error.message}`);
        }
    }

    async validateCommand(command) {
        // Validate the parsed command against available commands
        const validCommands = ['train', 'finetune', 'list', 'buy', 'lease', 'propose', 'vote'];
        
        if (!validCommands.includes(command.command)) {
            throw new Error('Unrecognized command');
        }

        return true;
    }
}

module.exports = { NLPService };