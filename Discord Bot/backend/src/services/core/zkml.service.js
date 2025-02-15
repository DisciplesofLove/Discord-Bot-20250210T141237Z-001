const { ZKMLVerifier } = require('@zkml/verifier');
const { ethers } = require('ethers');

class ZKMLService {
    constructor() {
        this.verifier = new ZKMLVerifier();
    }

    async generateComputeProof(modelId, input, output, params) {
        try {
            const proof = await this.verifier.generateProof({
                modelId,
                input,
                output,
                params
            });

            return {
                proof,
                metadata: {
                    timestamp: Date.now(),
                    modelId,
                    inputHash: ethers.utils.keccak256(JSON.stringify(input)),
                    outputHash: ethers.utils.keccak256(JSON.stringify(output))
                }
            };
        } catch (error) {
            console.error('ZKML proof generation error:', error);
            throw new Error(`Failed to generate ZKML proof: ${error.message}`);
        }
    }

    async verifyComputeProof(proof, metadata) {
        try {
            const result = await this.verifier.verify({
                proof,
                metadata
            });

            return {
                valid: result.valid,
                confidence: result.confidence,
                verification: {
                    timestamp: Date.now(),
                    verifier: this.verifier.address,
                    result
                }
            };
        } catch (error) {
            console.error('ZKML verification error:', error);
            throw new Error(`Failed to verify ZKML proof: ${error.message}`);
        }
    }
}

module.exports = ZKMLService;