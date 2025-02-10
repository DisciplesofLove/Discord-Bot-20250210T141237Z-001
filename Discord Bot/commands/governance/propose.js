const { SlashCommandBuilder } = require('@discordjs/builders');
const { BlockchainService } = require('../../../backend/src/services/core/blockchain.service');
const { DAOService } = require('../../../backend/src/services/core/dao.service');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('propose')
    .setDescription('Create a new DAO proposal for model governance')
    .addStringOption(option =>
      option
        .setName('title')
        .setDescription('Title of the proposal')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('description')
        .setDescription('Detailed description of the proposal')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Type of proposal')
        .setRequired(true)
        .addChoices(
          { name: 'Model Approval', value: 'model_approval' },
          { name: 'Parameter Update', value: 'parameter_update' },
          { name: 'Fine-tuning', value: 'fine_tuning' },
          { name: 'Ethical Guidelines', value: 'ethics' }
        ))
    .addStringOption(option =>
      option
        .setName('model_id')
        .setDescription('Related model ID (if applicable)')
        .setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const type = interaction.options.getString('type');
      const modelId = interaction.options.getString('model_id');

      const daoService = new DAOService();
      const blockchainService = new BlockchainService();

      await interaction.editReply('Creating governance proposal...');

      // Create the proposal
      const proposal = await daoService.createProposal({
        title,
        description,
        type,
        modelId,
        creator: interaction.user.id
      });

      // Set up quadratic voting contract
      const votingContract = await blockchainService.setupQuadraticVoting(proposal.id);

      await interaction.editReply(`
📜 Governance Proposal Created!

Details:
${type === 'model_approval' ? '🤖' : type === 'parameter_update' ? '⚙️' : type === 'fine_tuning' ? '🔄' : '⚖️'} Type: ${type}
📝 Title: ${title}
🔍 Description: ${description}
${modelId ? `🤖 Model ID: ${modelId}` : ''}

Voting:
🗳️ Proposal ID: ${proposal.id}
⚡ Voting Contract: ${votingContract.address}
📊 Current Status: Open
⏰ Voting Period: 7 days
🎯 Required Quorum: 10%

Use \`/vote ${proposal.id} yes/no\` to cast your vote
      `);

    } catch (error) {
      console.error('Proposal creation error:', error);
      await interaction.editReply('❌ Error creating proposal: ' + error.message);
    }
  },
};