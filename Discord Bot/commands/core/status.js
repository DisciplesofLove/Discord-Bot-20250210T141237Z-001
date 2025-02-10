const { SlashCommandBuilder } = require('@discordjs/builders');
const { AIService } = require('../../../backend/src/services/core/ai.service');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check the status of an AI training or fine-tuning job')
    .addStringOption(option =>
      option
        .setName('job_id')
        .setDescription('The ID of the job to check')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const jobId = interaction.options.getString('job_id');
      const aiService = new AIService();

      await interaction.editReply('Fetching job status...');

      const status = await aiService.getModelStatus(jobId);
      
      const progressBar = '█'.repeat(Math.floor(status.progress * 20)) + 
                         '░'.repeat(20 - Math.floor(status.progress * 20));

      await interaction.editReply(`
📊 Training Status for Job ${jobId}

Progress: [${progressBar}] ${Math.round(status.progress * 100)}%
Status: ${status.status}

Metrics:
${Object.entries(status.metrics).map(([key, value]) => `${key}: ${value}`).join('\n')}

Next update in 60 seconds...
      `);

    } catch (error) {
      console.error('Status check error:', error);
      await interaction.editReply('❌ Error checking status: ' + error.message);
    }
  },
};