// scripts/discord/register-commands.js
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { EnvironmentManager } = require('../../utils/envManager');
const fs = require('fs');
const path = require('path');

async function registerCommands() {
    const envManager = new EnvironmentManager();
    await envManager.loadEncryptedEnvironment();

    const commands = [];
    const commandFolders = ['core', 'dao', 'marketplace'];

    for (const folder of commandFolders) {
        const commandsPath = path.join(__dirname, '../../discord-bot/commands', folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            commands.push(command.data.toJSON());
        }
    }

    const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

registerCommands()
    .then(() => process.exit(0))
    .catch(console.error);
