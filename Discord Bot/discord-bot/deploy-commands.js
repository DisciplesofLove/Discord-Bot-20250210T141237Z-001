const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

async function deployCommands() {
    try {
        // Load command files
        const commandFolders = fs.readdirSync(commandsPath);
        
        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                }
            }
        }

        // Construct and prepare REST module
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);

        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // Deploy commands
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error('Error deploying commands:', error);
        process.exit(1);
    }
}

deployCommands();