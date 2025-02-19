const reputationService = require('../../services/dao/reputation.service');
const { validatePoints } = require('../../utils/validators');

class ReputationController {
    async awardLovePoints(req, res) {
        try {
            const { userId, points, action } = req.body;
            
            if (!validatePoints(points)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid points value'
                });
            }

            const result = await reputationService.awardLovePoints(userId, points, action);
            res.json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async assignVicePoints(req, res) {
        try {
            const { userId, points, action } = req.body;
            
            if (!validatePoints(points)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid points value'
                });
            }

            const result = await reputationService.assignVicePoints(userId, points, action);
            res.json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getReputationScores(req, res) {
        try {
            const { userId } = req.params;
            const result = await reputationService.getReputationScores(userId);
            res.json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getLeaderboard(req, res) {
        try {
            const { type = 'LOVE', limit = 10 } = req.query;
            const result = await reputationService.getLeaderboard(type, parseInt(limit));
            res.json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new ReputationController();