// discord-bot/commands/chattofile.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChatFileHandler } = require('../chat-file-handler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chattofile')
        .setDescription('Convert chat content to a file')
        .addStringOption(option =>
            option.setName('filename')
                .setDescription('Name for the file to create')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('content')
                .setDescription('Content to save in the file')
                .setRequired(true)),

    async execute(interaction, bot) {
        const filename = interaction.options.getString('filename');
        const content = interaction.options.getString('content');

        try {
            const chatFileHandler = new ChatFileHandler(bot.aiCodeService);
            const result = await chatFileHandler.createFileFromChat(content, filename);

            if (result.success) {
                await interaction.reply(result.message);
            } else {
                await interaction.reply(`Error creating file: ${result.error}`);
            }
        } catch (error) {
            await interaction.reply(`Failed to create file: ${error.message}`);
        }
    }
};