const { SlashCommandBuilder } = require('discord.js');
const p2pManager = require('../../utils/p2p-manager');
const { validateInput } = require('../../middleware/inputValidator');
const { permissionMiddleware } = require('../../middleware/permissionManager');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('store')
        .setDescription('Store data in IPFS')
        .addStringOption(option =>
            option.setName('content')
                .setDescription('Content to store')
                .setRequired(true)),

    middleware: [
        validateInput({
            content: {
                validate: (value) => {
                    if (!value || value.length < 1) {
                        throw new Error('Content cannot be empty');
                    }
                    return value;
                },
                required: true
            }
        }),
        permissionMiddleware(1) // Requires MODERATOR level
    ],

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const content = interaction.options.getString('content');
            
            // Store in IPFS
            const cid = await p2pManager.storeData({
                content,
                timestamp: new Date().toISOString(),
                author: interaction.user.id
            });

            logger.info('Data stored in IPFS', {
                cid,
                userId: interaction.user.id
            });

            await interaction.editReply({
                content: `Content stored successfully!\nCID: ${cid}`,
                ephemeral: true
            });
        } catch (error) {
            logger.error('Failed to store content:', error);
            await interaction.editReply({
                content: 'Failed to store content. Please try again.',
                ephemeral: true
            });
        }
    }
};