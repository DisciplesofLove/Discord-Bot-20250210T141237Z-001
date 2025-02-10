const { SlashCommandBuilder } = require('discord.js');
const command = require('../../commands/__template__/command');
const { InputValidator } = require('../../utils/inputValidator');

// Mock the discord.js interaction
const mockInteraction = {
    options: {
        getString: jest.fn()
    },
    reply: jest.fn(),
    deferReply: jest.fn(),
    editReply: jest.fn()
};

describe('Template Command', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should have correct command structure', () => {
        expect(command.data).toBeInstanceOf(SlashCommandBuilder);
        expect(command.data.name).toBeDefined();
        expect(command.data.description).toBeDefined();
        expect(command.execute).toBeDefined();
    });

    it('should validate input correctly', async () => {
        mockInteraction.options.getString.mockReturnValue('valid-input');
        
        await command.execute(mockInteraction);
        
        expect(mockInteraction.reply).toHaveBeenCalled();
        expect(mockInteraction.reply.mock.calls[0][0]).toContain('valid-input');
    });

    it('should throw error for invalid input', async () => {
        mockInteraction.options.getString.mockReturnValue('');
        
        await expect(command.execute(mockInteraction))
            .rejects
            .toThrow();
    });

    it('should handle errors gracefully', async () => {
        mockInteraction.options.getString.mockImplementation(() => {
            throw new Error('Mock error');
        });

        await expect(command.execute(mockInteraction))
            .rejects
            .toThrow('Mock error');
    });
});