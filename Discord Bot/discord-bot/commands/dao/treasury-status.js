const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const contractManager = require('../../utils/contract-manager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('treasury_status')
        .setDescription('Display current treasury status and recent transactions'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            // Fetch treasury data from smart contract
            const [ethBalance, joyBalance, recentTxs] = await Promise.all([
                contractManager.callContractMethod('Treasury', 'getEthBalance'),
                contractManager.callContractMethod('Treasury', 'getTokenBalance', 'JOY'),
                contractManager.callContractMethod('Treasury', 'getRecentTransactions')
            ]);

            // Create embedded message
            const embed = new EmbedBuilder()
                .setTitle('🏦 Treasury Status')
                .setColor(0x0099FF)
                .addFields(
                    { name: 'ETH Balance', value: `${ethBalance} ETH`, inline: true },
                    { name: 'JOY Balance', value: `${joyBalance} JOY`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Recent Transactions', value: formatTransactions(recentTxs) }
                )
                .setTimestamp();

            await interaction.editReply({
                embeds: [embed]
            });

        } catch (error) {
            console.error('Error in treasury_status command:', error);
            await interaction.editReply('Error fetching treasury status. Please try again later.');
        }
    },
};

function formatTransactions(transactions) {
    if (!transactions || transactions.length === 0) {
        return 'No recent transactions';
    }

    return transactions
        .map(tx => `${tx.type}: ${tx.amount} ${tx.token} - ${tx.description}`)
        .join('\n');
}