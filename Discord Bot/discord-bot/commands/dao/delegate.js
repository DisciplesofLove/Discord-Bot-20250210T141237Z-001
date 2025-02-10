const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delegate')
        .setDescription('Delegate your voting power to another user')
        .addUserOption(option =>
            option.setName('delegate')
                .setDescription('User to delegate voting power to')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('Amount of voting power to delegate (leave empty for all)')
                .setRequired(false)),

    async execute(interaction) {
        const delegateUser = interaction.options.getUser('delegate');
        const amount = interaction.options.getNumber('amount');

        try {
            // Mock delegation logic - replace with actual delegation implementation
            const delegationResult = {
                success: true,
                delegator: interaction.user.username,
                delegate: delegateUser.username,
                amount: amount || 'all',
                timestamp: new Date().toISOString()
            };

            const embed = new EmbedBuilder()
                .setColor('#33cc33')
                .setTitle('Voting Power Delegation')
                .setDescription('Delegation successfully processed')
                .addFields(
                    { name: 'Delegator', value: delegationResult.delegator, inline: true },
                    { name: 'Delegate', value: delegationResult.delegate, inline: true },
                    { name: 'Amount', value: delegationResult.amount.toString(), inline: true },
                    { name: 'Timestamp', value: delegationResult.timestamp, inline: false }
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in delegate command:', error);
            await interaction.reply({
                content: 'There was an error processing the delegation.',
                ephemeral: true
            });
        }
    },
};