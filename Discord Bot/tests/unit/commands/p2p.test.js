const { SlashCommandBuilder } = require('discord.js');
const storeCommand = require('../../../discord-bot/commands/p2p/store');
const retrieveCommand = require('../../../discord-bot/commands/p2p/retrieve');
const p2pManager = require('../../../discord-bot/utils/p2p-manager');

jest.mock('../../../discord-bot/utils/p2p-manager');

describe('P2P Commands', () => {
    let interaction;

    beforeEach(() => {
        interaction = {
            deferReply: jest.fn(),
            editReply: jest.fn(),
            options: {
                getString: jest.fn(),
            },
            user: {
                id: 'test-user-id'
            }
        };
    });

    describe('store command', () => {
        test('should store content in IPFS', async () => {
            const testContent = 'test content';
            const testCID = 'QmTest123';
            
            interaction.options.getString.mockReturnValue(testContent);
            p2pManager.storeData.mockResolvedValue(testCID);

            await storeCommand.execute(interaction);

            expect(p2pManager.storeData).toHaveBeenCalledWith(expect.objectContaining({
                content: testContent
            }));
            expect(interaction.editReply).toHaveBeenCalledWith(expect.objectContaining({
                content: expect.stringContaining(testCID)
            }));
        });
    });

    describe('retrieve command', () => {
        test('should retrieve content from IPFS', async () => {
            const testCID = 'QmTest123';
            const testData = { content: 'test content' };
            
            interaction.options.getString.mockReturnValue(testCID);
            p2pManager.getData.mockResolvedValue(testData);

            await retrieveCommand.execute(interaction);

            expect(p2pManager.getData).toHaveBeenCalledWith(testCID);
            expect(interaction.editReply).toHaveBeenCalledWith(expect.objectContaining({
                content: expect.stringContaining(JSON.stringify(testData))
            }));
        });
    });
});