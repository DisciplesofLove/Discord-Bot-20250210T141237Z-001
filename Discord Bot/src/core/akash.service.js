const { AkashClient } = require('@akashnetwork/client');

class AkashService {
  constructor() {
    this.client = new AkashClient({
      endpoint: process.env.AKASH_RPC_ENDPOINT,
      chain_id: process.env.AKASH_CHAIN_ID
    });
  }

  async deployTrainingEnvironment({ model, datasetPath, parameters }) {
    // Create deployment configuration
    const deploymentConfig = {
      image: 'deepseek-v4-training:latest',
      resources: {
        cpu: 8,
        memory: '32Gi',
        gpu: 1
      },
      env: {
        MODEL_TYPE: model,
        DATASET_PATH: datasetPath,
        TRAINING_PARAMS: JSON.stringify(parameters)
      }
    };

    // Deploy to Akash
    const deployment = await this.client.deploy(deploymentConfig);
    return deployment.id;
  }
}

module.exports = { AkashService };
