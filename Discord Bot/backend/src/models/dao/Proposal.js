const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
    // Schema definition will go here
});

module.exports = mongoose.model('Proposal', ProposalSchema);