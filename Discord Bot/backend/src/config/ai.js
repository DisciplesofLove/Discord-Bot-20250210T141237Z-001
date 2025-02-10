require('dotenv').config();

module.exports = {
    nlp: {
        model: process.env.NLP_MODEL || 'deepseek-base',
        maxTokens: parseInt(process.env.NLP_MAX_TOKENS) || 512,
        temperature: parseFloat(process.env.NLP_TEMPERATURE) || 0.7
    },
    federated: {
        minClientsPerRound: parseInt(process.env.FL_MIN_CLIENTS) || 3,
        aggregationMethod: process.env.FL_AGGREGATION_METHOD || 'fedavg',
        roundTimeout: parseInt(process.env.FL_ROUND_TIMEOUT) || 300000
    },
    training: {
        maxBatchSize: parseInt(process.env.MAX_BATCH_SIZE) || 64,
        maxEpochs: parseInt(process.env.MAX_EPOCHS) || 100,
        defaultLearningRate: parseFloat(process.env.DEFAULT_LEARNING_RATE) || 0.001
    },
    compute: {
        minCpuCores: parseInt(process.env.MIN_CPU_CORES) || 2,
        minMemoryGb: parseInt(process.env.MIN_MEMORY_GB) || 4,
        maxJobDuration: parseInt(process.env.MAX_JOB_DURATION) || 3600000
    },
    security: {
        maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS) || 5,
        maxDatasetSizeGb: parseInt(process.env.MAX_DATASET_SIZE_GB) || 10
    }
};