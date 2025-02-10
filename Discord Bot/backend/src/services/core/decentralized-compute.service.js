const AkashService = require('./akash.service');
const GolemService = require('./golem.service');
const IPFSService = require('./ipfs.service');
const { iota } = require('../../config/blockchain');

class DecentralizedComputeService {
    constructor() {
        this.akashService = new AkashService();
        this.golemService = new GolemService();
        this.ipfsService = new IPFSService();
    }

    async distributeComputation(modelConfig, data) {
        // Determine optimal compute provider based on requirements and cost
        const provider = await this.selectOptimalProvider(modelConfig);
        
        // Store training data on IPFS
        const dataHash = await this.ipfsService.store(data);
        
        // Initialize compute job
        const computeJob = await this.initializeComputeJob(provider, modelConfig, dataHash);
        
        return computeJob;
    }

    async selectOptimalProvider(requirements) {
        const akashCost = await this.akashService.estimateCost(requirements);
        const golemCost = await this.golemService.estimateCost(requirements);
        
        return akashCost < golemCost ? 'akash' : 'golem';
    }

    async initializeComputeJob(provider, config, dataHash) {
        if (provider === 'akash') {
            return this.akashService.createDeployment(config, dataHash);
        }
        return this.golemService.createTask(config, dataHash);
    }
}

module.exports = DecentralizedComputeService;