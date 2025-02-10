const express = require('express');
const router = express.Router();
const apiController = require('../../controllers/core/api.controller');
const auth = require('../../middleware/auth');

// Training endpoints
router.post('/train', auth, apiController.trainModel);
router.get('/training/:jobId', auth, apiController.getTrainingStatus);
router.get('/training/:jobId/results', auth, apiController.getTrainingResults);

// Natural language command processing
router.post('/process-command', auth, apiController.processCommand);

// Blockchain verification endpoints
router.get('/verify/:hash', auth, apiController.verifyMetadata);
router.get('/history/:userId', auth, apiController.getTransactionHistory);

// System status
router.get('/status', apiController.getSystemStatus);

module.exports = router;