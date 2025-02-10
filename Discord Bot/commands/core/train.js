const { SlashCommandBuilder } = require('@discordjs/builders');
const { AkashService } = require('../../../src/services/core/akash.service');
const { IPFSService } = require('../../../src/services/core/ipfs.service');
const { TrainingService } = require('../../../src/services/core/training.service');

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

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const datasetHash = interaction.options.getString('dataset');
      const parameters = JSON.parse(interaction.options.getString('parameters'));

      // Initialize services
      const ipfsService = new IPFSService();
      const akashService = new AkashService();
      const trainingService = new TrainingService();

      // Download dataset from IPFS
      await interaction.editReply('Downloading dataset from IPFS...');
      const datasetPath = await ipfsService.downloadDataset(datasetHash);

      // Prepare training job on Akash
      await interaction.editReply('Preparing training environment on Akash...');
      const deploymentId = await akashService.deployTrainingEnvironment({
        model: 'deepseek-v4',
        datasetPath,
        parameters
      });

      // Start training
      await interaction.editReply('Starting training process...');
      const trainingJob = await trainingService.startTraining(deploymentId);

      await interaction.editReply(`
Training job started successfully!
Deployment ID: ${deploymentId}
Training Job ID: ${trainingJob.id}
Monitor progress using \`/status ${trainingJob.id}\`
      `);

    } catch (error) {
      console.error('Training error:', error);
      await interaction.editReply('Error starting training: ' + error.message);
    }
  },
};
