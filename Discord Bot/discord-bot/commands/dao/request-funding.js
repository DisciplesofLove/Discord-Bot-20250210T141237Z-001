const { SlashCommandBuilder } = require('@discordjs/builders');
const contractManager = require('../../utils/contract-manager');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('request_funding')
        .setDescription('Create a funding request proposal')
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('Amount requested')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('token')
                .setDescription('Token symbol (JOY/ETH)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Proposal title')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Detailed description of the funding request')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        const amount = interaction.options.getNumber('amount');
        const token = interaction.options.getString('token').toUpperCase();
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');

        try {
            // Create proposal through contract manager
            const proposalData = {
                title,
                description,
                amount,
                token,
                proposer: interaction.user.id,
                type: 'FUNDING_REQUEST'
            };

            const proposalId = await contractManager.callContractMethod(
                'Treasury',
                'createProposal',
                proposalData
            );

            // Create embedded message for proposal
            const embed = new EmbedBuilder()
                .setTitle(`📑 New Funding Request: ${title}`)
                .setColor(0x0099FF)
                .addFields(
                    { name: 'Amount Requested', value: `${amount} ${token}`, inline: true },
                    { name: 'Proposer', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Proposal ID', value: proposalId.toString(), inline: true },
                    { name: 'Description', value: description }
                )
                .setTimestamp();

            await interaction.editReply({
                content: '✅ Funding request proposal created successfully!',
                embeds: [embed]
            });

        } catch (error) {
            console.error('Error in request_funding command:', error);
            await interaction.editReply('Error creating funding request. Please try again later.');
        }
    },
};