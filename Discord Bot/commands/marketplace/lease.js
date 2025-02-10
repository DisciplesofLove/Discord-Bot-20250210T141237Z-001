const { SlashCommandBuilder } = require('@discordjs/builders');
const { BlockchainService } = require('../../../backend/src/services/core/blockchain.service');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lease')
    .setDescription('Lease an AI model using IOTA feeless transactions')
    .addStringOption(option =>
      option
        .setName('model_id')
        .setDescription('The ID of the model to lease')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('duration')
        .setDescription('Lease duration in days')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const modelId = interaction.options.getString('model_id');
      const duration = interaction.options.getInteger('duration');
      
      const blockchainService = new BlockchainService();

      await interaction.editReply('Processing lease on IOTA network...');

      // Process the lease transaction
      const result = await blockchainService.processModelLease(
        modelId, 
        interaction.user.id,
        duration * 24 * 60 * 60 * 1000 // Convert days to milliseconds
      );

      await interaction.editReply(`
✅ Model Leased Successfully!

Lease Details:
📊 Model ID: ${modelId}
⏱️ Duration: ${duration} days
🔑 Lease ID: ${result.leaseId}
📅 Start Time: ${new Date(result.startTime).toLocaleString()}
📅 End Time: ${new Date(result.endTime).toLocaleString()}
      `);

    } catch (error) {
      console.error('Lease error:', error);
      await interaction.editReply('❌ Error leasing model: ' + error.message);
    }
  },
};