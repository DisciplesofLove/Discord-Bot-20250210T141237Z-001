const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('analytics')
        .setDescription('View detailed marketplace analytics')
        .addStringOption(option =>
            option.setName('period')
                .setDescription('Time period for analytics')
                .setRequired(true)
                .addChoices(
                    { name: 'Day', value: 'day' },
                    { name: 'Week', value: 'week' },
                    { name: 'Month', value: 'month' }
                )),

    async execute(interaction) {
        const period = interaction.options.getString('period');

        try {
            // Mock analytics data - replace with actual analytics
            const analytics = {
                totalVolume: 15000,
                transactions: 125,
                uniqueBuyers: 45,
                uniqueSellers: 32,
                averagePrice: 120,
                topSellers: ['Seller1', 'Seller2', 'Seller3'],
                popularCategories: ['NFTs', 'Training Data', 'Models'],
                growth: '+25%'
            };

            const embed = new EmbedBuilder()
                .setColor('#ff6600')
                .setTitle(`Marketplace Analytics - Last ${period}`)
                .addFields(
                    { name: 'Total Volume', value: `$${analytics.totalVolume}`, inline: true },
                    { name: 'Transactions', value: analytics.transactions.toString(), inline: true },
                    { name: 'Unique Buyers', value: analytics.uniqueBuyers.toString(), inline: true },
                    { name: 'Unique Sellers', value: analytics.uniqueSellers.toString(), inline: true },
                    { name: 'Average Price', value: `$${analytics.averagePrice}`, inline: true },
                    { name: 'Growth', value: analytics.growth, inline: true },
                    { name: 'Top Sellers', value: analytics.topSellers.join(', '), inline: false },
                    { name: 'Popular Categories', value: analytics.popularCategories.join(', '), inline: false }
                )
                .setFooter({ text: 'Analytics updated in real-time' });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in analytics command:', error);
            await interaction.reply({
                content: 'There was an error fetching marketplace analytics.',
                ephemeral: true
            });
        }
    },
};