const { SlashCommandBuilder } = require('@discordjs/builders');
const QRCode = require('qrcode');
const { createCanvas } = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const contractManager = require('../../utils/contract-manager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription('Generate deposit address and QR code for treasury deposits')
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('Amount to deposit')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('token')
                .setDescription('Token to deposit (ETH/JOY)')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        
        const amount = interaction.options.getNumber('amount');
        const token = interaction.options.getString('token').toUpperCase();
        
        try {
            // Get treasury address from contract manager
            const treasuryAddress = await contractManager.callContractMethod('Treasury', 'getAddress');
            
            // Generate QR code
            const canvas = createCanvas(256, 256);
            await QRCode.toCanvas(canvas, treasuryAddress, {
                width: 256,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
            
            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'qr-code.png' });
            
            const response = `🏦 **Treasury Deposit Information**
Amount: ${amount} ${token}
Treasury Address: \`${treasuryAddress}\`
\nScan the QR code or copy the address above to make your deposit.
\n⚠️ Please ensure you're sending from a wallet you own and the amount matches exactly.`;
            
            await interaction.editReply({
                content: response,
                files: [attachment]
            });
        } catch (error) {
            console.error('Error in deposit command:', error);
            await interaction.editReply('Error generating deposit information. Please try again later.');
        }
    },
};