class ModelRegistry {
    constructor() {
        this.models = new Map();
    }

    async getModel(modelId) {
        const model = this.models.get(modelId);
        if (!model) {
            // Initialize new model if it doesn't exist
            const newModel = {
                id: modelId,
                weights: this.initializeWeights(),
                version: 0,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            this.models.set(modelId, newModel);
            return newModel;
        }
        return model;
    }

    async updateModel(modelId, update) {
        const model = await this.getModel(modelId);
        const updatedModel = {
            ...model,
            ...update,
            version: model.version + 1,
            updatedAt: Date.now()
        };
        this.models.set(modelId, updatedModel);
        return updatedModel;
    }

    initializeWeights() {
        // Initialize with random weights
        // In production, this would load pretrained weights
        return Array.from({ length: 1000 }, () => Math.random() * 2 - 1);
    }

    async getModelHistory(modelId) {
        const model = await this.getModel(modelId);
        return {
            id: model.id,
            version: model.version,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt
        };
    }
}

module.exports = { ModelRegistry };