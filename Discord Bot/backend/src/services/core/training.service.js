const Member = require('../../models/dao/Member');

class TrainingService {
    constructor() {
        this.SCORE_VALUES = {
            GOOD_TRAINING: 10,
            BAD_TRAINING: -5,
            GOOD_DATASET: 8,
            BAD_DATASET: -4,
            PARTICIPATION: 2
        };
    }

    async updateMemberReputation(discordId, action, description) {
        const scoreValue = this.SCORE_VALUES[action] || 0;
        
        const member = await Member.findOne({ discordId });
        if (!member) {
            throw new Error('Member not found');
        }

        // Update the appropriate score based on whether it's positive or negative
        if (scoreValue > 0) {
            member.loveScore += scoreValue;
        } else {
            member.viceScore += Math.abs(scoreValue);
        }

        // Add to reputation history
        member.reputationHistory.push({
            action,
            score: scoreValue,
            description
        });

        await member.save();
        return member;
    }

    async getMemberReputation(discordId) {
        const member = await Member.findOne({ discordId });
        if (!member) {
            throw new Error('Member not found');
        }

        return {
            loveScore: member.loveScore,
            viceScore: member.viceScore,
            total: member.loveScore - member.viceScore,
            history: member.reputationHistory
        };
    }
}