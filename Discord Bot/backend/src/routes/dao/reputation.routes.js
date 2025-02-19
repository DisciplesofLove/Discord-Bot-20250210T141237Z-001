const express = require('express');
const router = express.Router();
const reputationController = require('../../controllers/dao/reputation.controller');
const { authenticateToken } = require('../../middleware/auth');

// Love & Vice Reputation System Routes
router.post('/love', authenticateToken, reputationController.awardLovePoints);
router.post('/vice', authenticateToken, reputationController.assignVicePoints);
router.get('/scores/:userId', authenticateToken, reputationController.getReputationScores);
router.get('/leaderboard', authenticateToken, reputationController.getLeaderboard);

module.exports = router;