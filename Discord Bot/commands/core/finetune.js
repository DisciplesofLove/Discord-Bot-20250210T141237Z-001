const { SlashCommandBuilder } = require('@discordjs/builders');
const { AIService } = require('../../../backend/src/services/core/ai.service');
const { BlockchainService } = require('../../../backend/src/services/core/blockchain.service');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('finetune')
    .setDescription('Fine-tune an existing AI model with federated learning')
    .addStringOption(option =>
      option
        .setName('model_id')
        .setDescription('The ID of the model to fine-tune')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('dataset')
        .setDescription('IPFS hash of the fine-tuning dataset')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('parameters')
        .setDescription('Fine-tuning parameters in JSON format')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const modelId = interaction.options.getString('model_id');
      const datasetHash = interaction.options.getString('dataset');
      const parameters = JSON.parse(interaction.options.getString('parameters'));

      const aiService = new AIService();
      const blockchainService = new BlockchainService();

      await interaction.editReply('Setting up federated fine-tuning...');

      // Initialize federated learning session
      const federatedSession = await blockchainService.setupFederatedLearning([interaction.user.id]);

      // Start fine-tuning process
      const result = await aiService.trainModel({
        datasetHash,
        modelId,
        parameters,
        federatedLearning: true,
        federatedSessionId: federatedSession.contractAddress
      });

      await interaction.editReply(`
🎉 Fine-tuning Started Successfully!

Details:
📊 Original Model ID: ${modelId}
🔄 Fine-tuning Job ID: ${result.jobId}
🤝 Federated Session: ${federatedSession.contractAddress}
📦 New Model Metadata: ipfs://${result.metadataHash}

Monitor progress with \`/status ${result.jobId}\`
      `);

    } catch (error) {
      console.error('Fine-tuning error:', error);
      await interaction.editReply('❌ Error starting fine-tuning: ' + error.message);
    }
  },
};