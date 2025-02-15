const { Web3 } = require('web3');
const { BittensorNetwork } = require('@bittensor/sdk');
const { ZKMLVerifier } = require('@zkml/verifier');

class ConsensusService {
    constructor() {
        this.bittensor = new BittensorNetwork({
            endpoint: process.env.BITTENSOR_ENDPOINT
        });
        this.zkmlVerifier = new ZKMLVerifier();
    }

    async verifyInference(modelId, inputData, outputData, computeProof) {
        // Verify the AI computation using ZKML
        const verificationResult = await this.zkmlVerifier.verify({
            modelId,
            input: inputData,
            output: outputData,
            proof: computeProof
        });

        if (!verificationResult.valid) {
            throw new Error('Invalid computation proof');
        }

        return verificationResult;
    }

    async calculateUsefulnessScore(inferenceResult, userFeedback) {
        // Calculate PoU score based on:
        // 1. Model accuracy/quality
        // 2. User feedback/ratings
        // 3. Computational efficiency
        const accuracyScore = inferenceResult.accuracy || 0;
        const feedbackScore = userFeedback.rating || 0;
        const computeEfficiencyScore = inferenceResult.latency ? (1000 / inferenceResult.latency) : 0;

        const weightedScore = (
            (accuracyScore * 0.4) +
            (feedbackScore * 0.4) +
            (computeEfficiencyScore * 0.2)
        );

        return {
            score: weightedScore,
            metrics: {
                accuracy: accuracyScore,
                feedback: feedbackScore,
                efficiency: computeEfficiencyScore
            }
        };
    }

    async distributeRewards(validators, usefulnessScores) {
        // Distribute rewards based on PoI and PoU scores
        for (const validator of validators) {
            const score = usefulnessScores[validator.id];
            if (score && score > 0) {
                await this.bittensor.reward({
                    validatorId: validator.id,
                    amount: score * process.env.REWARD_MULTIPLIER
                });
            }
        }
    }
}

module.exports = ConsensusService;