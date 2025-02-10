const { SlashCommandBuilder } = require('discord.js');
const p2pManager = require('../../utils/p2p-manager');
const { validateInput } = require('../../middleware/inputValidator');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('retrieve')
        .setDescription('Retrieve data from IPFS')
        .addStringOption(option =>
            option.setName('cid')
                .setDescription('Content identifier (CID)')
                .setRequired(true)),

    middleware: [
        validateInput({
            cid: {
                validate: (value) => {
                    if (!/^[a-zA-Z0-9]+$/.test(value)) {
                        throw new Error('Invalid CID format');
                    }
                    return value;
                },
                required: true
            }
        })
    ],

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const cid = interaction.options.getString('cid');
            const data = await p2pManager.getData(cid);

            logger.info('Data retrieved from IPFS', {
                cid,
                userId: interaction.user.id
            });

            await interaction.editReply({
                content: `Retrieved content:\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``,
                ephemeral: true
            });
        } catch (error) {
            logger.error('Failed to retrieve content:', error);
            await interaction.editReply({
                content: 'Failed to retrieve content. Please verify the CID and try again.',
                ephemeral: true
            });
        }
    }
};