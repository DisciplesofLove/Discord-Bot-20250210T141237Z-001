const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('contributions')
        .setDescription('Track and view user contributions to the project')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View contributions')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to check contributions for (defaults to you)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Record a new contribution')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of contribution')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Code', value: 'code' },
                            { name: 'Documentation', value: 'docs' },
                            { name: 'Community Support', value: 'support' },
                            { name: 'Content Creation', value: 'content' }
                        ))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Brief description of the contribution')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'view') {
            const targetUser = interaction.options.getUser('user') || interaction.user;
            
            // Mock data - replace with actual database queries
            const contributions = [
                { type: 'code', description: 'Implemented new feature X', date: '2023-01-01' },
                { type: 'docs', description: 'Updated installation guide', date: '2023-01-15' },
                { type: 'support', description: 'Helped 5 users with setup', date: '2023-02-01' }
            ];

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle(`Contributions by ${targetUser.username}`)
                .setDescription('Recent contributions to the project')
                .setThumbnail(targetUser.displayAvatarURL());

            contributions.forEach(contribution => {
                embed.addFields({
                    name: `${contribution.type.toUpperCase()} - ${contribution.date}`,
                    value: contribution.description
                });
            });

            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'add') {
            const type = interaction.options.getString('type');
            const description = interaction.options.getString('description');

            // Mock data - replace with actual database insertion
            await interaction.reply({
                content: `Successfully recorded your ${type} contribution: ${description}`,
                ephemeral: true
            });
        }
    },
};