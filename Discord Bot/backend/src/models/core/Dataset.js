const mongoose = require('mongoose');

const DatasetSchema = new mongoose.Schema({
    // Schema definition will go here
});

module.exports = mongoose.model('Dataset', DatasetSchema);