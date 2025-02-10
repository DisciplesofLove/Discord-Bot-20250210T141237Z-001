const { SlashCommandBuilder } = require('discord.js');
const contractManager = require('../../utils/contract-manager');
const { validateInput } = require('../../middleware/inputValidator');
const { permissionMiddleware } = require('../../middleware/permissionManager');
const { PermissionLevel } = require('../../middleware/permissionManager');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('contract')
        .setDescription('Interact with smart contracts')
        .addSubcommand(subcommand =>
            subcommand
                .setName('call')
                .setDescription('Call a contract method')
                .addStringOption(option =>
                    option.setName('contract')
                        .setDescription('Contract name')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('method')
                        .setDescription('Method name')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('args')
                        .setDescription('Arguments (JSON array)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('send')
                .setDescription('Send a contract transaction')
                .addStringOption(option =>
                    option.setName('contract')
                        .setDescription('Contract name')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('method')
                        .setDescription('Method name')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('args')
                        .setDescription('Arguments (JSON array)')
                        .setRequired(false))),

    middleware: [
        validateInput({
            contract: {
                validate: (value) => {
                    if (!value || value.length < 1) {
                        throw new Error('Contract name cannot be empty');
                    }
                    return value;
                },
                required: true
            },
            method: {
                validate: (value) => {
                    if (!value || value.length < 1) {
                        throw new Error('Method name cannot be empty');
                    }
                    return value;
                },
                required: true
            },
            args: {
                validate: (value) => {
                    if (value) {
                        try {
                            return JSON.parse(value);
                        } catch {
                            throw new Error('Invalid JSON format for arguments');
                        }
                    }
                    return [];
                },
                required: false
            }
        }),
        permissionMiddleware(PermissionLevel.ADMIN)
    ],

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const subcommand = interaction.options.getSubcommand();
            const contractName = interaction.options.getString('contract');
            const methodName = interaction.options.getString('method');
            const args = interaction.options.getString('args');
            const parsedArgs = args ? JSON.parse(args) : [];

            let result;
            if (subcommand === 'call') {
                result = await contractManager.callContractMethod(
                    contractName,
                    methodName,
                    ...parsedArgs
                );
            } else {
                result = await contractManager.sendTransaction(
                    contractName,
                    methodName,
                    interaction.user.id,
                    ...parsedArgs
                );
            }

            logger.info(`Contract ${subcommand} executed`, {
                contract: contractName,
                method: methodName,
                userId: interaction.user.id
            });

            await interaction.editReply({
                content: `Contract ${subcommand} successful!\nResult: \`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``,
                ephemeral: true
            });
        } catch (error) {
            logger.error('Contract interaction failed:', error);
            await interaction.editReply({
                content: `Contract ${interaction.options.getSubcommand()} failed: ${error.message}`,
                ephemeral: true
            });
        }
    }
};