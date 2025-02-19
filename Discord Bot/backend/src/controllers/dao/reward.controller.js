const rewardService = require('../../services/dao/reward.service');

class RewardController {
    async claimRewards(req, res) {
        try {
            const { userId } = req.body;
            const result = await rewardService.claimRewards(userId);
            res.json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getRewardTiers(req, res) {
        try {
            const result = await rewardService.getRewardTiers();
            res.json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getNFTBalance(req, res) {
        try {
            const { userId } = req.params;
            const result = await rewardService.getNFTBalance(userId);
            res.json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new RewardController();