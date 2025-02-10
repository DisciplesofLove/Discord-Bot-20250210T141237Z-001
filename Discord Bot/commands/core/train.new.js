const { SlashCommandBuilder } = require('@discordjs/builders');
const { AkashService } = require('../../../src/services/core/akash.service');
const { IPFSService } = require('../../../src/services/core/ipfs.service');
const { TrainingService } = require('../../../src/services/core/training.service');
const { CommandValidator } = require('./validation');
const { CommandPerformance } = require('./performance');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('train')
        .setDescription('Start training a Deepseek v4 model')
        .addStringOption(option =>
            option
                .setName('dataset')
                .setDescription('IPFS hash of the dataset')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('parameters')
                .setDescription('Training parameters in JSON format')
                .setRequired(true)),

    cooldown: 60, // 1 minute cooldown
    permissions: ['MANAGE_MESSAGES'], // Example permission requirement

    async execute(interaction) {
        const performance = new CommandPerformance();
        performance.startTracking('train', interaction.user.id);

        await interaction.deferReply();

        try {
            // Validate inputs
            const datasetHash = interaction.options.getString('dataset');
            let parameters;

            try {
                parameters = JSON.parse(interaction.options.getString('parameters'));
            } catch (error) {
                await interaction.editReply('Invalid JSON format for parameters');
                return;
            }

            // Validate parameters schema
            const expectedArgs = [
                { name: 'dataset', type: 'string', required: true },
                { name: 'parameters', type: 'object', required: true }
            ];

            if (!CommandValidator.validateArguments([datasetHash, parameters], expectedArgs)) {
                await interaction.editReply('Invalid command arguments provided');
                return;
            }

            // Initialize services
            const ipfsService = new IPFSService();
            const akashService = new AkashService();
            const trainingService = new TrainingService();

            // Validate dataset exists in IPFS
            const datasetExists = await ipfsService.exists(datasetHash);
            if (!datasetExists) {
                await interaction.editReply('Dataset not found in IPFS');
                return;
            }

            // Start training process
            const trainingJob = await trainingService.startTraining({
                datasetHash,
                parameters,
                userId: interaction.user.id
            });

            // Deploy to Akash
            const deployment = await akashService.deployTrainingJob(trainingJob);

            const metrics = performance.endTracking('train', interaction.user.id);
            console.log(`Training command metrics:`, metrics);

            await interaction.editReply({
                content: 'Training job started successfully!',
                embeds: [{
                    title: 'Training Job Details',
                    fields: [
                        { name: 'Job ID', value: trainingJob.id },
                        { name: 'Dataset', value: datasetHash },
                        { name: 'Deployment ID', value: deployment.id }
                    ]
                }]
            });

        } catch (error) {
            console.error('Error in train command:', error);
            
            const errorMessage = error.message || 'An unexpected error occurred';
            await interaction.editReply(`Error: ${errorMessage}`);
            
            const metrics = performance.endTracking('train', interaction.user.id);
            console.log(`Training command error metrics:`, metrics);
        }
    }
};