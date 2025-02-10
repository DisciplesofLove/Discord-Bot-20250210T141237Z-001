const { Client } = require('discord.js');
const { errorHandler } = require('../../discord-bot/middleware/errorHandler');
const { permissionManager } = require('../../discord-bot/middleware/permissionManager');
const { validateInput } = require('../../discord-bot/middleware/inputValidator');

describe('Command Integration Tests', () => {
    let client;
    let mockInteraction;

    beforeAll(async () => {
        client = new Client({ intents: [] });
        mockInteraction = {
            commandName: 'test',
            user: { id: '123' },
            guildId: '456',
            reply: jest.fn(),
            deferReply: jest.fn(),
            editReply: jest.fn(),
            options: new Map()
        };
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Command Pipeline', () => {
        test('should handle command with middleware chain', async () => {
            const middleware = [
                validateInput({
                    testParam: {
                        required: true,
                        validate: (value) => value
                    }
                }),
                (interaction, next) => {
                    interaction.testValue = 'processed';
                    return next();
                }
            ];

            mockInteraction.options.set('testParam', { value: 'test' });

            for (const mid of middleware) {
                await mid(mockInteraction, () => Promise.resolve());
            }

            expect(mockInteraction.testValue).toBe('processed');
            expect(mockInteraction.validatedOptions).toBeDefined();
        });

        test('should handle permission checks', async () => {
            mockInteraction.member = {
                roles: {
                    cache: new Map([
                        ['admin', { name: 'admin' }]
                    ])
                }
            };

            const hasPermission = permissionManager.checkPermission(
                mockInteraction.member,
                2 // ADMIN level
            );

            expect(hasPermission).toBe(true);
        });

        test('should handle errors properly', async () => {
            const error = new Error('Test error');
            error.code = 'INTERNAL_ERROR';

            await errorHandler(error, mockInteraction);

            expect(mockInteraction.reply).toHaveBeenCalledWith(
                expect.objectContaining({
                    content: expect.any(String),
                    ephemeral: true
                })
            );
        });
    });
});