const mongoose = require('mongoose');

const RevenueSchema = new mongoose.Schema({
    // Schema definition will go here
});

module.exports = mongoose.model('Revenue', RevenueSchema);