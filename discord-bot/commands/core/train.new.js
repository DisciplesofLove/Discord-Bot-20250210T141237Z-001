const { SlashCommandBuilder } = require('@discordjs/builders');
const { AIService } = require('../../../backend/src/services/core/ai.service');
const { BlockchainService } = require('../../../backend/src/services/core/blockchain.service');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('train')
    .setDescription('Train and mint an AI model with decentralized compute')
    .addStringOption(option =>
      option
        .setName('dataset')
        .setDescription('IPFS hash of the dataset')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('model_type')
        .setDescription('Type of AI model to train')
        .setRequired(true)
        .addChoices(
          { name: 'Deepseek v4', value: 'deepseek-v4' },
          { name: 'GPT-J', value: 'gpt-j' },
          { name: 'BERT', value: 'bert' }
        ))
    .addStringOption(option =>
      option
        .setName('parameters')
        .setDescription('Training parameters in JSON format')
        .setRequired(true))
    .addBooleanOption(option =>
      option
        .setName('federated')
        .setDescription('Enable federated learning')
        .setRequired(false))
    .addBooleanOption(option =>
      option
        .setName('use_golem')
        .setDescription('Use Golem Network for compute')
        .setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const datasetHash = interaction.options.getString('dataset');
      const modelType = interaction.options.getString('model_type');
      const parameters = JSON.parse(interaction.options.getString('parameters'));
      const federatedLearning = interaction.options.getBoolean('federated') || false;
      const useGolem = interaction.options.getBoolean('use_golem') || false;

      // Initialize services
      const aiService = new AIService();
      const blockchainService = new BlockchainService();

      await interaction.editReply('Starting decentralized AI training process...');

      // Start training with enhanced features
      const result = await aiService.trainModel({
        datasetHash,
        modelType,
        parameters,
        federatedLearning,
        useGolem
      });

      // Set up federated learning if enabled
      if (federatedLearning) {
        await blockchainService.setupFederatedLearning([interaction.user.id]);
      }

      const marketplaceUrl = `https://joymarketplace.io/models/${result.nftAddress}/${result.nftTokenId}`;
      
      await interaction.editReply(`
🎉 AI Training Started Successfully!

Training Details:
📊 Job ID: ${result.jobId}
🖥️ Deployment ID: ${result.deploymentId}
🔗 NFT Contract: ${result.nftAddress}
🏷️ Token ID: ${result.nftTokenId}
📦 Model Metadata: ipfs://${result.metadataHash}

${federatedLearning ? '🤝 Federated Learning: Enabled' : ''}
${useGolem ? '⚡ Computing Network: Golem' : '⚡ Computing Network: Akash'}

View your model on JoyMarketplace:
${marketplaceUrl}

Monitor training progress with \`/status ${result.jobId}\`
      `);

    } catch (error) {
      console.error('Training error:', error);
      await interaction.editReply('❌ Error starting training: ' + error.message);
    }
  },
};