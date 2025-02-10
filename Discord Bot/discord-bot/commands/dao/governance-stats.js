const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('governance-stats')
        .setDescription('View DAO governance statistics and metrics'),

    async execute(interaction) {
        try {
            // Mock data - replace with actual governance statistics
            const stats = {
                totalProposals: 45,
                activeProposals: 3,
                totalVotes: 1250,
                averageParticipation: '65%',
                quorumRate: '82%',
                topVoters: ['User1', 'User2', 'User3'],
                recentProposals: [
                    { id: 'PROP-001', title: 'Treasury Allocation', status: 'Passed' },
                    { id: 'PROP-002', title: 'Protocol Update', status: 'Active' },
                    { id: 'PROP-003', title: 'Community Grant', status: 'Failed' }
                ]
            };

            const embed = new EmbedBuilder()
                .setColor('#9933ff')
                .setTitle('DAO Governance Statistics')
                .setDescription('Current governance metrics and participation statistics')
                .addFields(
                    { name: 'Total Proposals', value: stats.totalProposals.toString(), inline: true },
                    { name: 'Active Proposals', value: stats.activeProposals.toString(), inline: true },
                    { name: 'Total Votes Cast', value: stats.totalVotes.toString(), inline: true },
                    { name: 'Average Participation', value: stats.averageParticipation, inline: true },
                    { name: 'Quorum Achievement Rate', value: stats.quorumRate, inline: true },
                    { name: 'Top Voters', value: stats.topVoters.join(', '), inline: false },
                    { name: 'Recent Proposals', value: stats.recentProposals
                        .map(p => `${p.id}: ${p.title} (${p.status})`)
                        .join('\n'), inline: false }
                )
                .setFooter({ text: 'Statistics updated every 24 hours' });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in governance-stats command:', error);
            await interaction.reply({
                content: 'There was an error fetching governance statistics.',
                ephemeral: true
            });
        }
    },
};