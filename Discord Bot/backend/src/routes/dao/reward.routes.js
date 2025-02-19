const express = require('express');
const router = express.Router();
const rewardController = require('../../controllers/dao/reward.controller');
const { authenticateToken } = require('../../middleware/auth');

router.post('/claim', authenticateToken, rewardController.claimRewards);
router.get('/tiers', authenticateToken, rewardController.getRewardTiers);
router.get('/nft/:userId', authenticateToken, rewardController.getNFTBalance);

module.exports = router;