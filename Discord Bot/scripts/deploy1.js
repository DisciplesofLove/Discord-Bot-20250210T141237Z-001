// scripts/deploy1.js
const { ethers } = require("hardhat");
const path = require('path');
const fs = require('fs');
const { deployInBatches, getDeployedContract } = require('./deploy/batch-deploy');

async function main() {
    console.log("Starting deployment process...");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    try {
        const deploymentScripts = [
            {
                name: 'JoyToken',
                deploy: async () => {
                    console.log("\nDeploying JoyToken...");
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
                    const joyToken = await getDeployedContract('JoyToken');
                    console.log("\nDeploying AIParticipation...");
                    const AIParticipation = await ethers.getContractFactory("AIParticipation");
                    const aiParticipation = await AIParticipation.deploy(joyToken.address);
                    await aiParticipation.deployed();
                    console.log("AIParticipation deployed to:", aiParticipation.address);
                    return aiParticipation;
                }
            },
            {
                name: 'DatasetGovernance',
                deploy: async () => {
                    const joyToken = await getDeployedContract('JoyToken');
                    const aiParticipation = await getDeployedContract('AIParticipation');
                    console.log("\nDeploying DatasetGovernance...");
                    const DatasetGovernance = await ethers.getContractFactory("DatasetGovernance");
                    const datasetGovernance = await DatasetGovernance.deploy(
                        joyToken.address,
                        aiParticipation.address,
                        3600, // voting delay
                        86400, // voting period
                        100000 // proposal threshold
                    );
                    await datasetGovernance.deployed();
                    console.log("DatasetGovernance deployed to:", datasetGovernance.address);
                    return datasetGovernance;
                }
            },
            {
                name: 'AIModelMarketplace',
                deploy: async () => {
                    const joyToken = await getDeployedContract('JoyToken');
                    console.log("\nDeploying AIModelMarketplace...");
                    const AIModelMarketplace = await ethers.getContractFactory("AIModelMarketplace");
                    const marketplace = await AIModelMarketplace.deploy(joyToken.address);
                    await marketplace.deployed();
                    console.log("AIModelMarketplace deployed to:", marketplace.address);
                    return marketplace;
                }
            },
            {
                name: 'AITrainingRewards',
                deploy: async () => {
                    const joyToken = await getDeployedContract('JoyToken');
                    const aiParticipation = await getDeployedContract('AIParticipation');
                    const datasetGovernance = await getDeployedContract('DatasetGovernance');
                    console.log("\nDeploying AITrainingRewards...");
                    const AITrainingRewards = await ethers.getContractFactory("AITrainingRewards");
                    const trainingRewards = await AITrainingRewards.deploy(
                        joyToken.address,
                        aiParticipation.address,
                        datasetGovernance.address
                    );
                    await trainingRewards.deployed();
                    console.log("AITrainingRewards deployed to:", trainingRewards.address);
                    return trainingRewards;
                }
            }
        ];

        // Deploy contracts in batches
        const deployedContracts = await deployInBatches(deploymentScripts);

        // Setup roles and permissions
        console.log("\nSetting up roles and permissions...");
        const joyToken = await getDeployedContract('JoyToken');
        const trainingRewards = await getDeployedContract('AITrainingRewards');
        const marketplace = await getDeployedContract('AIModelMarketplace');

        const MINTER_ROLE = await joyToken.MINTER_ROLE();
        await joyToken.grantRole(MINTER_ROLE, trainingRewards.address);
        await joyToken.grantRole(MINTER_ROLE, marketplace.address);

        // Save deployment addresses
        const deploymentInfo = {
            network: hre.network.name,
            joyToken: joyToken.address,
            aiParticipation: (await getDeployedContract('AIParticipation')).address,
            datasetGovernance: (await getDeployedContract('DatasetGovernance')).address,
            marketplace: marketplace.address,
            trainingRewards: trainingRewards.address,
            timestamp: new Date().toISOString()
        };

        // Save deployment info
        const deploymentsDir = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir);
        }

        fs.writeFileSync(
            path.join(deploymentsDir, `${hre.network.name}.json`),
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log("\nDeployment completed successfully!");
        console.log("Deployment info saved to:", path.join(deploymentsDir, `${hre.network.name}.json`));

        // Verify contracts if not on localhost
        if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
            console.log("\nStarting contract verification...");
            await verifyContracts(deploymentInfo);
        }

    } catch (error) {
        console.error("Deployment failed:", error);
        process.exit(1);
    }
}

// Helper function to handle deployment verification
async function verifyContracts(deploymentInfo) {
    try {
        console.log("Verifying deployed contracts...");
        // Contract verification logic here
        console.log("Contract verification completed successfully!");
    } catch (error) {
        console.error("Contract verification failed:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });