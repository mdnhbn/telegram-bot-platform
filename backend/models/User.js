// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: {
        type: String,
        required: true,
        unique: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        default: '',
    },
    photoUrl: {
        type: String,
        default: '',
    },
    balance: {
        type: Number,
        default: 0,
    },
    xp: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 1,
    },
    isVerified: { // For channel join verification
        type: Boolean,
        default: false,
    },
    isBanned: {
        type: Boolean,
        default: false,
    },
    referralCode: {
        type: String,
        unique: true,
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    cryptoWalletAddress: {
        type: String,
        default: '',
    },
    // Daily task tracking
    dailyTaskCount: {
        type: Number,
        default: 0,
    },
    lastTaskDate: {
        type: Date,
        default: null,
    },
    // Daily bonus tracking
    lastBonusClaim: {
        type: Date,
        default: null,
    },
}, { timestamps: true }); // Automatically add createdAt and updatedAt

// Create a unique referral code before saving a new user
UserSchema.pre('save', function(next) {
    if (this.isNew) {
        // A simple referral code generation logic
        this.referralCode = `${this.firstName.slice(0, 3)}${Math.random().toString(36).substr(2, 5)}`.toLowerCase();
    }
    next();
});


module.exports = mongoose.model('User', UserSchema);
