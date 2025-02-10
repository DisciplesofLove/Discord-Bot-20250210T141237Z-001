const express = require('express');
const router = express.Router();
const AIService = require('../../services/core/ai.service');
const auth = require('../middleware/auth');

const aiService = new AIService();

// Train AI model
router.post('/train', auth, async (req, res) => {
    try {
        const { modelConfig, trainingData } = req.body;
        const result = await aiService.trainModel(modelConfig, trainingData, req.user.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get model training status
router.get('/status/:jobId', auth, async (req, res) => {
    try {
        const status = await aiService.getTrainingStatus(req.params.jobId);
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fine-tune existing model
router.post('/finetune/:modelId', auth, async (req, res) => {
    try {
        const { tuningData, parameters } = req.body;
        const result = await aiService.fineTuneModel(req.params.modelId, tuningData, parameters);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;