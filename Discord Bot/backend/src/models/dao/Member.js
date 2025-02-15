const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
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