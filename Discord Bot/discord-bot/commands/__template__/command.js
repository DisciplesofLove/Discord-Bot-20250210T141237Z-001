const { SlashCommandBuilder } = require('discord.js');
const { InputValidator } = require('../../utils/inputValidator');

const commandSchema = {
    // Define command options validation schema
    name: {
        type: 'string',
        options: {
            minLength: 1,
            maxLength: 100,
            allowedCharacters: /^[\w\s-]+$/
        }
    }
};

module.exports = {
    // Command definition
    data: new SlashCommandBuilder()
        .setName('command-name')
        .setDescription('Command description')
        .addStringOption(option =>
            option.setName('parameter')
                .setDescription('Parameter description')
                .setRequired(true)),

    // Command execution
    async execute(interaction) {
        try {
            // Validate inputs
            const options = {
                name: interaction.options.getString('parameter')
            };
            const validatedOptions = await InputValidator.validateCommandOptions(options, commandSchema);

            // Command logic here
            await interaction.reply(`Command executed with: ${validatedOptions.name}`);

        } catch (error) {
            throw error; // ErrorHandler middleware will catch and handle this
        }
    },
};