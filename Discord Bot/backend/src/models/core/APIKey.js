const mongoose = require('mongoose');

const APIKeySchema = new mongoose.Schema({
    // Schema definition will go here
});

module.exports = mongoose.model('APIKey', APIKeySchema);