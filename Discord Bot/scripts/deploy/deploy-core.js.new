// scripts/deploy/deploy-core.js
const { ethers } = require("hardhat");
const { EnvironmentManager } = require('../../utils/envManager');
const { deployInBatches } = require('./batch-deploy');

async function deployCore() {
    const envManager = new EnvironmentManager();
    await envManager.loadEncryptedEnvironment();

    console.log("Preparing core contract deployments...");

    // Prepare deployment scripts
    const deploymentScripts = [
        {
            name: 'JoyToken',
            deploy: async () => {
                const JoyToken = await ethers.getContractFactory("JoyToken");
                const joyToken = await JoyToken.deploy();
                await joyToken.deployed();
                console.log("JoyToken deployed to:", joyToken.address);
                return joyToken;
            }
        },
        {
            name: 'AIParticipation',
            deploy: async () => {
                const JoyToken = await ethers.getContractFactory("JoyToken");
                const joyToken = await JoyToken.deploy();
                const AIParticipation = await ethers.getContractFactory("AIParticipation");
                const aiParticipation = await AIParticipation.deploy(joyToken.address);
                await aiParticipation.deployed();
                console.log("AIParticipation deployed to:", aiParticipation.address);
                return aiParticipation;
            }
        }
    ];

    // Deploy in batches
    await deployInBatches(deploymentScripts);

    console.log("Core contracts deployed successfully");
}

deployCore()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });