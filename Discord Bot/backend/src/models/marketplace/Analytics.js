const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    // Schema definition will go here
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);