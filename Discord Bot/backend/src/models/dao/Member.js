const mongoose = require('mongoose');

const reputationSchema = new mongoose.Schema({
    loveScore: {
        type: Number,
        default: 0,
        min: 0
    },
    viceScore: {
        type: Number,
        default: 0,
        min: 0
    },
    lastUpdateTime: {
        type: Date,
        default: Date.now
    },
    reputationHistory: [{
        action: String,
        points: Number,
        type: {
            type: String,
            enum: ['LOVE', 'VICE']
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
});

const MemberSchema = new mongoose.Schema({
    reputation: reputationSchema,
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    loveScore: { type: Number, default: 0 }, // Positive reputation score
    viceScore: { type: Number, default: 0 }, // Negative reputation score
    reputationHistory: [{
        timestamp: { type: Date, default: Date.now },
        action: { type: String, enum: ['GOOD_TRAINING', 'BAD_TRAINING', 'GOOD_DATASET', 'BAD_DATASET', 'PARTICIPATION'] },
        score: Number,
        description: String
    }]
});

module.exports = mongoose.model('Member', MemberSchema);