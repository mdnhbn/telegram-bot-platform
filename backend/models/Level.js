// backend/models/Level.js
const mongoose = require('mongoose');

const LevelSchema = new mongoose.Schema({
    level: {
        type: Number,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    xpRequired: {
        type: Number,
        required: true,
    },
    dailyTaskLimit: {
        type: Number,
        required: true,
    },
    unlockedFeatures: { // e.g., ['P2P_TRANSFER', 'HIGHER_WITHDRAW_LIMIT']
        type: [String],
        default: [],
    },
});

module.exports = mongoose.model('Level', LevelSchema);
