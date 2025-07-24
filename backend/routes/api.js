// backend/routes/api.js
const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
// অন্যান্য কন্ট্রোলারগুলোও এখানে যুক্ত হবে

// --- Authentication Routes ---
router.post('/auth/check-status', authController.checkUserStatus);
router.get('/auth/channels', authController.getChannels);
router.post('/auth/verify-join', authController.verifyJoin);

// --- User Routes ---
router.post('/user/dashboard', userController.getDashboardData);

// --- Task Routes ---
// (এখানে টাস্ক সম্পর্কিত রুট যোগ হবে)

// --- Wallet Routes ---
// (এখানে ওয়ালেট সম্পর্কিত রুট যোগ হবে)


module.exports = router;
