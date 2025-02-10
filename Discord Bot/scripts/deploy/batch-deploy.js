// scripts/deploy/batch-deploy.js
const fs = require('fs');
const path = require('path');

async function deployInBatches(scripts, batchSize = 75) {
    console.log(`Starting batched deployment with ${scripts.length} total scripts...`);
    
    const deployedContracts = {};
    const progressFile = path.join(__dirname, 'deployment-progress.json');
    
    // Load existing progress if any
    if (fs.existsSync(progressFile)) {
        try {
            const progress = JSON.parse(fs.readFileSync(progressFile));
            Object.assign(deployedContracts, progress.deployedContracts || {});
            console.log("Loaded existing deployment progress");
        } catch (error) {
            console.warn("Failed to load existing progress:", error);
        }
    }
    
    const batches = [];
    for (let i = 0; i < scripts.length; i += batchSize) {
        batches.push(scripts.slice(i, i + batchSize));
    }
    
    console.log(`Split into ${batches.length} batches`);
    
    for (let i = 0; i < batches.length; i++) {
        console.log(`\nProcessing batch ${i + 1} of ${batches.length}`);
        const batch = batches[i];
        
        try {
            for (const script of batch) {
                // Skip if already deployed
                if (deployedContracts[script.name]) {
                    console.log(`Script ${script.name} already deployed, skipping...`);
                    continue;
                }
                
                console.log(`Deploying script: ${script.name}`);
                const deployedContract = await script.deploy();
                deployedContracts[script.name] = deployedContract;
                
                // Save progress after each individual deployment
                fs.writeFileSync(progressFile, JSON.stringify({
                    totalScripts: scripts.length,
                    completedBatches: i,
                    lastCompletedScript: script.name,
                    timestamp: new Date().toISOString(),
                    deployedContracts
                }, null, 2));
            }
            console.log(`Successfully completed batch ${i + 1}`);
            
        } catch (error) {
            console.error(`Error in batch ${i + 1}:`, error);
            throw error;
        }
        
        // Add a small delay between batches to prevent overloading
        if (i < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    
    console.log('\nAll batches completed successfully!');
    return deployedContracts;
}

async function getDeployedContract(name) {
    const progressFile = path.join(__dirname, 'deployment-progress.json');
    if (!fs.existsSync(progressFile)) {
        throw new Error(`No deployment progress file found`);
    }
    
    try {
        const progress = JSON.parse(fs.readFileSync(progressFile));
        if (!progress.deployedContracts || !progress.deployedContracts[name]) {
            throw new Error(`Contract ${name} not found in deployment progress`);
        }
        return progress.deployedContracts[name];
    } catch (error) {
        throw new Error(`Failed to get deployed contract ${name}: ${error.message}`);
    }
}

module.exports = {
    deployInBatches,
    getDeployedContract
};