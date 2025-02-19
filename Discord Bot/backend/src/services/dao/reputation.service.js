const { ethers } = require('ethers');
const Member = require('../../models/dao/Member');
const ReputationSystemABI = require('../../../Contracts/ReputationSystem.json');
const config = require('../../config');
const iotaReputationService = require('../integration/iota-reputation.service');

class ReputationService {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(config.ethereumRPC);
        this.contract = new ethers.Contract(
            config.contracts.reputationSystem,
            ReputationSystemABI,
            this.provider
        );
    }

    async awardLovePoints(userId, points, action) {
        try {
            const member = await Member.findOne({ discordId: userId });
            if (!member || !member.walletAddress) {
                throw new Error('Member not found or wallet not linked');
            }

            // Store in blockchain
            await this.contract.awardLovePoints(member.walletAddress, points, action);
            
            // Store in IOTA + IPFS
            await iotaReputationService.storeReputationData(userId, action, points, 'LOVE');
            
            // Update local database
            member.reputation = member.reputation || {};
            member.reputation.loveScore = (member.reputation.loveScore || 0) + points;
            member.reputation.reputationHistory.push({
                action,
                points,
                type: 'LOVE',
                timestamp: new Date()
            });
            await member.save();

            return {
                success: true,
                message: `Awarded ${points} love points for ${action}`,
                newScore: member.reputation.loveScore
            };
        } catch (error) {
            console.error('Error awarding love points:', error);
            throw error;
        }
    }

    async assignVicePoints(userId, points, action) {
        try {
            const member = await Member.findOne({ discordId: userId });
            if (!member || !member.walletAddress) {
                throw new Error('Member not found or wallet not linked');
            }

            // Store in blockchain
            await this.contract.assignVicePoints(member.walletAddress, points, action);
            
            // Store in IOTA + IPFS
            await iotaReputationService.storeReputationData(userId, action, points, 'VICE');
            
            // Update local database
            member.reputation = member.reputation || {};
            member.reputation.viceScore = (member.reputation.viceScore || 0) + points;
            member.reputation.reputationHistory.push({
                action,
                points,
                type: 'VICE',
                timestamp: new Date()
            });
            await member.save();

            return {
                success: true,
                message: `Assigned ${points} vice points for ${action}`,
                newScore: member.reputation.viceScore
            };
        } catch (error) {
            console.error('Error assigning vice points:', error);
            throw error;
        }
    }

    async getReputationScores(userId) {
        try {
            const member = await Member.findOne({ discordId: userId });
            if (!member || !member.walletAddress) {
                throw new Error('Member not found or wallet not linked');
            }

            const [loveScore, viceScore] = await this.contract.getReputationScores(member.walletAddress);

            return {
                success: true,
                loveScore: loveScore.toNumber(),
                viceScore: viceScore.toNumber(),
                history: member.reputation?.reputationHistory || []
            };
        } catch (error) {
            console.error('Error getting reputation scores:', error);
            throw error;
        }
    }

    async getLeaderboard(type = 'LOVE', limit = 10) {
        try {
            const members = await Member.find({
                'reputation.loveScore': { $exists: true }
            })
            .sort({ [`reputation.${type.toLowerCase()}Score`]: -1 })
            .limit(limit)
            .select('discordId reputation');

            return {
                success: true,
                leaderboard: members.map(member => ({
                    discordId: member.discordId,
                    score: type === 'LOVE' ? member.reputation.loveScore : member.reputation.viceScore
                }))
            };
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            throw error;
        }
    }
}

module.exports = new ReputationService();