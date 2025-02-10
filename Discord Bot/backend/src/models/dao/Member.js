const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    // Schema definition will go here
});

module.exports = mongoose.model('Member', MemberSchema);