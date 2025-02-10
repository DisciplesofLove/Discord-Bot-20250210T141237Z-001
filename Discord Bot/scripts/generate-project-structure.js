const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const createFile = (filePath, content) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content);
    console.log(`Created: ${filePath}`);
};

const generateProjectStructure = () => {
    // Root directory
    const projectRoot = process.cwd();

    // Smart Contracts
    const contractsPath = path.join(projectRoot, 'smart-contracts/contracts');
    
    // Core Contracts
    createFile(path.join(contractsPath, 'core/JoyToken.sol'), `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract JoyToken is ERC20, Ownable {
    constructor() ERC20("Joy Token", "JOY") {
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }
}
    `);

    // Backend Services
    const servicesPath = path.join(projectRoot, 'backend/src/services');
    
    createFile(path.join(servicesPath, 'core/ipfs.service.js'), `
const { create } = require('ipfs-http-client');

class IPFSService {
    constructor() {
        this.ipfs = create({
            host: process.env.IPFS_HOST,
            port: process.env.IPFS_PORT,
            protocol: process.env.IPFS_PROTOCOL
        });
    }

    async uploadToIPFS(data) {
        try {
            const result = await this.ipfs.add(data);
            return result.cid.toString();
        } catch (error) {
            console.error('IPFS upload error:', error);
            throw error;
        }
    }
}

module.exports = IPFSService;
    `);

    // Discord Bot
    const discordPath = path.join(projectRoot, 'discord-bot');
    
    createFile(path.join(discordPath, 'bot.js'), `
require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

const loadCommands = async () => {
    const commandFolders = ['core', 'dao', 'marketplace'];
    
    for (const folder of commandFolders) {
        const commandsPath = path.join(__dirname, 'commands', folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            client.commands.set(command.data.name, command);
        }
    }
};

const loadEvents = async () => {
    const eventFolders = ['core', 'dao'];
    
    for (const folder of eventFolders) {
        const eventsPath = path.join(__dirname, 'events', folder);
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
        
        for (const file of eventFiles) {
            const event = require(path.join(eventsPath, file));
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        }
    }
};

client.once('ready', () => {
    console.log('Bot is ready!');
});

loadCommands();
loadEvents();

client.login(process.env.DISCORD_TOKEN);
    `);

    // Create package.json if it doesn't exist
    if (!fs.existsSync(path.join(projectRoot, 'package.json'))) {
        createFile(path.join(projectRoot, 'package.json'), `
{
    "name": "ai-dao-bot",
    "version": "1.0.0",
    "description": "AI DAO Discord Bot with Smart Contracts",
    "main": "backend/src/server.js",
    "scripts": {
        "start": "node backend/src/server.js",
        "dev": "nodemon backend/src/server.js",
        "test": "jest",
        "generate": "node scripts/generate-project-structure.js",
        "deploy:contracts": "npx hardhat run scripts/deploy/deploy-core.js --network polygon",
        "discord:deploy": "node discord-bot/deploy-commands.js"
    },
    "dependencies": {
        "@openzeppelin/contracts": "^4.9.0",
        "discord.js": "^14.11.0",
        "dotenv": "^16.0.3",
        "ethers": "^5.7.2",
        "express": "^4.18.2",
        "ipfs-http-client": "^60.0.0",
        "mongoose": "^7.2.1"
    },
    "devDependencies": {
        "@nomiclabs/hardhat-ethers": "^2.2.3",
        "@nomiclabs/hardhat-waffle": "^2.0.6",
        "hardhat": "^2.14.0",
        "jest": "^29.5.0",
        "nodemon": "^2.0.22"
    }
}
        `);
    }

    // Create necessary configuration files
    createFile(path.join(projectRoot, 'hardhat.config.js'), `
require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

module.exports = {
    solidity: "0.8.17",
    networks: {
        polygon: {
            url: process.env.WEB3_RPC_URL,
            accounts: [process.env.PRIVATE_KEY]
        }
    }
};
    `);

    // Install dependencies
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    console.log('Project structure generated successfully!');
};

// Run the generator
generateProjectStructure();
