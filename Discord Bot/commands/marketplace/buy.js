const { SlashCommandBuilder } = require('@discordjs/builders');
const { BlockchainService } = require('../../../backend/src/services/core/blockchain.service');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Purchase an AI model from the JoyMarketplace')
    .addStringOption(option =>
      option
        .setName('model_id')
        .setDescription('The ID of the model to purchase')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const modelId = interaction.options.getString('model_id');
      const blockchainService = new BlockchainService();

      await interaction.editReply('Processing purchase on JoyMarketplace...');

      // Process the purchase transaction
      const result = await blockchainService.purchaseModel(modelId, interaction.user.id);

      await interaction.editReply(`
✅ Model Purchased Successfully!

Transaction Details:
📊 Model ID: ${modelId}
🔗 Transaction Hash: ${result.transactionHash}
📦 Model Access: ipfs://${result.modelHash}
      `);

    } catch (error) {
      console.error('Purchase error:', error);
      await interaction.editReply('❌ Error purchasing model: ' + error.message);
    }
  },
};