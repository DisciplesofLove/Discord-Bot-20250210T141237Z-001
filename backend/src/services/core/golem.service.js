const { GolemNetwork } = require('@golem-network/sdk');

class GolemService {
    constructor() {
        this.golem = new GolemNetwork({
            projectId: process.env.GOLEM_PROJECT_ID
        });
    }

    async deployTrainingEnvironment({ model, datasetPath, parameters, federatedLearning }) {
        try {
            const deployment = await this.golem.createDeployment({
                model,
                dataset: datasetPath,
                parameters,
                federatedLearning,
                requirements: {
                    minCPU: 4,
                    minRAM: 16,
                    minGPU: 1
                }
            });

            return deployment.id;
        } catch (error) {
            console.error('Golem deployment error:', error);
            throw new Error(`Failed to deploy on Golem: ${error.message}`);
        }
    }
}

module.exports = { GolemService };