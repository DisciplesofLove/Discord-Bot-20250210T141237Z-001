const { SlashCommandBuilder } = require('@discordjs/builders');
const { BlockchainService } = require('../../../backend/src/services/core/blockchain.service');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('List an AI model on the JoyMarketplace')
    .addStringOption(option =>
      option
        .setName('model_id')
        .setDescription('The ID of the trained model to list')
        .setRequired(true))
    .addNumberOption(option => 
      option
        .setName('price')
        .setDescription('Price in JOY tokens')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const modelId = interaction.options.getString('model_id');
      const price = interaction.options.getNumber('price');

      const blockchainService = new BlockchainService();
      
      await interaction.editReply('Listing model on JoyMarketplace...');

      const result = await blockchainService.listOnMarketplace(modelId, interaction.user.id, price);

      await interaction.editReply(`
✅ Model Listed Successfully!

Marketplace Details:
📊 Model ID: ${modelId}
💰 Price: ${price} JOY
🏪 Marketplace URL: https://joymarketplace.io/models/${result.tokenId}
      `);

    } catch (error) {
      console.error('Listing error:', error);
      await interaction.editReply('❌ Error listing model: ' + error.message);
    }
  },
};