const { Client, GatewayIntentBits } = require('discord.js');

describe('Discord Bot', () => {
    let client;

    beforeEach(() => {
        client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages
            ]
        });
    });

    afterEach(() => {
        if (client) {
            client.destroy();
        }
    });

    test('should initialize with correct intents', () => {
        expect(client.options.intents).toContain(GatewayIntentBits.Guilds);
        expect(client.options.intents).toContain(GatewayIntentBits.GuildMessages);
    });

    // Add more test cases here
});