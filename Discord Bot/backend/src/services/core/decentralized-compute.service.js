const AkashService = require('./akash.service');
const GolemService = require('./golem.service');
const IPFSService = require('./ipfs.service');
const { BittensorNetwork } = require('@bittensor/sdk');
const ConsensusService = require('./consensus.service');
const { IotaService } = require('./iota.service');
const L2Service = require('./l2.service');
const { iota } = require('../../config/blockchain');

class DecentralizedComputeService {
    constructor() {
        this.akashService = new AkashService();
        this.golemService = new GolemService();
        this.ipfsService = new IPFSService();
        this.bittensor = new BittensorNetwork({
            endpoint: process.env.BITTENSOR_ENDPOINT
        });
        this.consensusService = new ConsensusService();
        this.iotaService = new IotaService();
        this.l2Service = new L2Service();
        this.iotaBridge = require('./iota-bridge.service');
    }

    async distributeComputation(modelConfig, data) {
        try {
            // Store training data on IPFS with redundancy
            const dataHash = await this.ipfsService.store(data, {
                replicationFactor: 3,
                persistence: true
            });
            
            // Select optimal provider considering cost and performance
            const provider = await this.selectOptimalProvider({
                ...modelConfig.requirements,
                dataSize: data.length,
                priority: modelConfig.priority
            });
            
            // Initialize compute job with consensus validation
            const computeJob = await this.initializeComputeJob(provider, {
                ...modelConfig,
                dataHash,
                consensus: {
                    minVerifiers: 3,
                    requiredConfidence: 0.95
                }
            });
            
            // Monitor job progress and collect metrics
            await this.monitorJobProgress(computeJob.id);
            
            return {
                ...computeJob,
                dataLocation: {
                    ipfs: dataHash,
                    protocol: 'ipfs'
                }
            };
        } catch (error) {
            console.error('Distributed computation error:', error);
            throw new Error(`Failed to distribute computation: ${error.message}`);
        }
    }

    async monitorJobProgress(jobId) {
        // Monitor job execution and collect metrics
        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(async () => {
                try {
                    const status = await this.getJobStatus(jobId);
                    if (status.completed) {
                        clearInterval(checkInterval);
                        resolve(status);
                    } else if (status.failed) {
                        clearInterval(checkInterval);
                        reject(new Error(status.error));
                    }
                } catch (error) {
                    clearInterval(checkInterval);
                    reject(error);
                }
            }, 5000); // Check every 5 seconds
        });
    }

    async selectOptimalProvider(requirements) {
        // Get costs from different providers
        const akashCost = await this.akashService.estimateCost(requirements);
        const golemCost = await this.golemService.estimateCost(requirements);
        const bittensorCost = await this.bittensor.estimateInferenceCost(requirements);
        
        // Select the most cost-effective provider
        const costs = [
            { provider: 'akash', cost: akashCost },
            { provider: 'golem', cost: golemCost },
            { provider: 'bittensor', cost: bittensorCost }
        ];
        
        return costs.reduce((a, b) => a.cost < b.cost ? a : b).provider;
    }

    async initializeComputeJob(provider, config, dataHash) {
        let job;
        switch (provider) {
            case 'akash':
                job = await this.akashService.createDeployment(config, dataHash);
                break;
            case 'golem':
                job = await this.golemService.createTask(config, dataHash);
                break;
            case 'bittensor':
                job = await this.bittensor.initializeInference({
                    modelId: config.modelId,
                    inputHash: dataHash,
                    requirements: config.requirements
                });
                break;
            default:
                throw new Error(`Unknown compute provider: ${provider}`);
        }

        // Verify computation with PoI
        const computeProof = await this.generateComputeProof(job);
        const verificationResult = await this.consensusService.verifyInference(
            config.modelId,
            dataHash,
            job.outputHash,
            computeProof
        );

        // Calculate and record usefulness score
        const usefulnessScore = await this.consensusService.calculateUsefulnessScore(
            job.result,
            config.userFeedback
        );

        // Distribute rewards based on PoU
        await this.consensusService.distributeRewards(
            [job.validatorId],
            { [job.validatorId]: usefulnessScore.score }
        );

        return {
            ...job,
            verification: verificationResult,
            usefulnessScore
        };
    }
}

module.exports = DecentralizedComputeService;