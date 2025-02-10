const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('participation')
        .setDescription('View your participation metrics and rewards')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to check participation for (defaults to you)')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        
        try {
            // Mock data - replace with actual database queries
            const metrics = {
                messageCount: 150,
                reactionsGiven: 45,
                reactionsReceived: 32,
                commandsUsed: 28,
                proposalsCreated: 3,
                votesParticipated: 12,
                lastActive: new Date().toISOString()
            };

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Participation Metrics for ${targetUser.username}`)
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    { name: 'Messages Sent', value: metrics.messageCount.toString(), inline: true },
                    { name: 'Reactions Given', value: metrics.reactionsGiven.toString(), inline: true },
                    { name: 'Reactions Received', value: metrics.reactionsReceived.toString(), inline: true },
                    { name: 'Commands Used', value: metrics.commandsUsed.toString(), inline: true },
                    { name: 'Proposals Created', value: metrics.proposalsCreated.toString(), inline: true },
                    { name: 'Votes Participated', value: metrics.votesParticipated.toString(), inline: true },
                    { name: 'Last Active', value: metrics.lastActive, inline: false }
                )
                .setFooter({ text: 'Participation metrics are updated hourly' });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in participation command:', error);
            await interaction.reply({
                content: 'There was an error fetching participation metrics.',
                ephemeral: true
            });
        }
    },
};