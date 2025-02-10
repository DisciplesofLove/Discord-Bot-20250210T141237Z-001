const mongoose = require('mongoose');

const TrainingSchema = new mongoose.Schema({
    // Schema definition will go here
});

module.exports = mongoose.model('Training', TrainingSchema);