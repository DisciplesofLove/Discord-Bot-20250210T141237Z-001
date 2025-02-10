const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('engagement')
        .setDescription('View community engagement metrics')
        .addSubcommand(subcommand =>
            subcommand
                .setName('personal')
                .setDescription('View your personal engagement metrics'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('community')
                .setDescription('View overall community engagement metrics')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        try {
            if (subcommand === 'personal') {
                // Mock data - replace with actual metrics calculation
                const personalMetrics = {
                    weeklyActivity: 85,
                    monthlyGrowth: '+15%',
                    contributionStreak: 7,
                    engagementScore: 'A+',
                    topChannels: ['general', 'development', 'suggestions'],
                    recentAchievements: ['Active Voter', 'Regular Contributor']
                };

                const embed = new EmbedBuilder()
                    .setColor('#ff00ff')
                    .setTitle('Your Engagement Metrics')
                    .setDescription(`Engagement report for ${interaction.user.username}`)
                    .addFields(
                        { name: 'Weekly Activity', value: `${personalMetrics.weeklyActivity}%`, inline: true },
                        { name: 'Monthly Growth', value: personalMetrics.monthlyGrowth, inline: true },
                        { name: 'Contribution Streak', value: `${personalMetrics.contributionStreak} days`, inline: true },
                        { name: 'Engagement Score', value: personalMetrics.engagementScore, inline: true },
                        { name: 'Top Active Channels', value: personalMetrics.topChannels.join(', '), inline: false },
                        { name: 'Recent Achievements', value: personalMetrics.recentAchievements.join(', '), inline: false }
                    );

                await interaction.reply({ embeds: [embed] });
            } else if (subcommand === 'community') {
                // Mock data - replace with actual community metrics
                const communityMetrics = {
                    activeUsers: 250,
                    messagesSent: 1500,
                    newMembers: 45,
                    totalProposals: 25,
                    averageParticipation: '78%',
                    topContributors: ['User1', 'User2', 'User3']
                };

                const embed = new EmbedBuilder()
                    .setColor('#ff00ff')
                    .setTitle('Community Engagement Overview')
                    .setDescription('Last 30 days of community activity')
                    .addFields(
                        { name: 'Active Users', value: communityMetrics.activeUsers.toString(), inline: true },
                        { name: 'Messages Sent', value: communityMetrics.messagesSent.toString(), inline: true },
                        { name: 'New Members', value: communityMetrics.newMembers.toString(), inline: true },
                        { name: 'Total Proposals', value: communityMetrics.totalProposals.toString(), inline: true },
                        { name: 'Average Participation', value: communityMetrics.averageParticipation, inline: true },
                        { name: 'Top Contributors', value: communityMetrics.topContributors.join(', '), inline: false }
                    );

                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error in engagement command:', error);
            await interaction.reply({
                content: 'There was an error fetching engagement metrics.',
                ephemeral: true
            });
        }
    },
};