const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
    // Schema definition will go here
});

module.exports = mongoose.model('Vote', VoteSchema);