module.exports = {
    // Bittensor network configuration
    network: {
        endpoint: process.env.BITTENSOR_ENDPOINT || 'wss://archivelb.nakamoto.opentensor.ai:9944',
        networkId: process.env.BITTENSOR_NETWORK_ID || 'finney'
    },
    
    // Consensus parameters
    consensus: {
        // Proof of Inference settings
        poi: {
            minVerifiers: 3,
            verificationTimeout: 30000, // 30 seconds
            requiredConfidence: 0.95
        },
        
        // Proof of Usefulness settings
        pou: {
            // Scoring weights
            weights: {
                accuracy: 0.4,
                feedback: 0.4,
                efficiency: 0.2
            },
            
            // Minimum scores required for rewards
            minimumScores: {
                accuracy: 0.7,
                feedback: 0.6,
                efficiency: 0.5
            },
            
            // Reward parameters
            rewards: {
                baseMultiplier: 1.0,
                bonusMultiplier: 1.5,
                maxRewardPerBlock: '100000000' // In TAO wei
            }
        }
    },
    
    // Resource requirements
    resources: {
        compute: {
            minCPU: 4,
            minRAM: 16,
            minGPU: 1,
            preferredGPUType: ['NVIDIA RTX 3080', 'NVIDIA RTX 3090']
        },
        
        storage: {
            minSpace: 100, // GB
            replication: 3
        }
    },
    
    // Node selection parameters
    nodeSelection: {
        minStake: '100000000000', // Minimum stake in TAO wei
        minUptime: 0.95,
        maxLatency: 100, // ms
        geoDiversification: true
    }
};