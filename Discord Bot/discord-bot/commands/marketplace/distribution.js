const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('distribution')
        .setDescription('View revenue distribution details and history')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of distribution information')
                .setRequired(true)
                .addChoices(
                    { name: 'Summary', value: 'summary' },
                    { name: 'Personal', value: 'personal' },
                    { name: 'History', value: 'history' }
                )),

    async execute(interaction) {
        const type = interaction.options.getString('type');

        try {
            let embed = new EmbedBuilder().setColor('#ff9900');

            switch (type) {
                case 'summary': {
                    // Mock summary data
                    const summary = {
                        totalDistributed: 50000,
                        participants: 150,
                        averageShare: 333.33,
                        nextDistribution: '2024-02-01',
                        treasury: 15000
                    };

                    embed
                        .setTitle('Revenue Distribution Summary')
                        .addFields(
                            { name: 'Total Distributed', value: `$${summary.totalDistributed}`, inline: true },
                            { name: 'Participants', value: summary.participants.toString(), inline: true },
                            { name: 'Average Share', value: `$${summary.averageShare}`, inline: true },
                            { name: 'Next Distribution', value: summary.nextDistribution, inline: true },
                            { name: 'Treasury Balance', value: `$${summary.treasury}`, inline: true }
                        );
                    break;
                }
                case 'personal': {
                    // Mock personal data
                    const personal = {
                        totalEarned: 1500,
                        pendingAmount: 250,
                        lastPayout: '2024-01-15',
                        contribution: '3%',
                        rank: 15
                    };

                    embed
                        .setTitle(`Distribution Details for ${interaction.user.username}`)
                        .addFields(
                            { name: 'Total Earned', value: `$${personal.totalEarned}`, inline: true },
                            { name: 'Pending Amount', value: `$${personal.pendingAmount}`, inline: true },
                            { name: 'Last Payout', value: personal.lastPayout, inline: true },
                            { name: 'Contribution Share', value: personal.contribution, inline: true },
                            { name: 'Rank', value: `#${personal.rank}`, inline: true }
                        );
                    break;
                }
                case 'history': {
                    // Mock history data
                    const history = [
                        { date: '2024-01-15', amount: 10000, participants: 145 },
                        { date: '2024-01-01', amount: 12000, participants: 140 },
                        { date: '2023-12-15', amount: 9000, participants: 138 }
                    ];

                    embed
                        .setTitle('Distribution History')
                        .setDescription('Recent distribution events')
                        .addFields(
                            ...history.map(h => ({
                                name: `Distribution on ${h.date}`,
                                value: `Amount: $${h.amount}\nParticipants: ${h.participants}`,
                                inline: false
                            }))
                        );
                    break;
                }
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in distribution command:', error);
            await interaction.reply({
                content: 'There was an error fetching distribution information.',
                ephemeral: true
            });
        }
    },
};