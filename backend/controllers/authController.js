// backend/controllers/authController.js
const User = require('../models/User');
const Channel = require('../models/Channel'); // আমরা এই মডেলটি পরে তৈরি করব
const axios = require('axios');

// একটি Helper ফাংশন (পরে অ্যাডমিন প্যানেল থেকে চ্যানেল যোগ হবে)
const getChannelsFromDB = async () => {
    // আপাতত হার্ডকোডেড, পরে ডেটাবেস থেকে আসবে
    return [
        { name: 'Our News Channel', url: 'https://t.me/YourChannelUsername1', id: '@YourChannelUsername1' },
        { name: 'Partner Updates', url: 'https://t.me/YourChannelUsername2', id: '@YourChannelUsername2' },
    ];
};

exports.checkUserStatus = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findOne({ telegramId: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found. Please register." });
        }

        res.status(200).json({ isVerified: user.isVerified, isBanned: user.isBanned });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getChannels = async (req, res) => {
    try {
        // এই ফাংশনটি অ্যাডমিন প্যানেল থেকে যোগ করা চ্যানেলগুলো ডেটাবেস থেকে নিয়ে আসবে
        // আপাতত আমরা হার্ডকোডেড ডেটা ব্যবহার করছি
        const channels = await getChannelsFromDB();
        res.status(200).json(channels.map(c => ({ name: c.name, url: c.url })));
    } catch (error) {
        res.status(500).json({ message: "Could not fetch channels" });
    }
};

exports.verifyJoin = async (req, res) => {
    try {
        const { userId, initData } = req.body;
        const botToken = process.env.TELEGRAM_BOT_TOKEN;

        const channels = await getChannelsFromDB();
        let allJoined = true;

        for (const channel of channels) {
            try {
                const response = await axios.get(`https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${channel.id}&user_id=${userId}`);
                const status = response.data.result.status;
                if (!['member', 'administrator', 'creator'].includes(status)) {
                    allJoined = false;
                    break;
                }
            } catch (err) {
                console.error(`Error checking channel ${channel.id}:`, err.response ? err.response.data : err.message);
                // যদি বট চ্যানেলে অ্যাডমিন না থাকে বা অন্য কোনো সমস্যা হয়
                allJoined = false; 
                break;
            }
        }

        if (allJoined) {
            let user = await User.findOne({ telegramId: userId });
            const tgUser = new URLSearchParams(initData).get('user');
            const parsedUser = JSON.parse(decodeURIComponent(tgUser));

            if (!user) {
                user = new User({
                    telegramId: userId,
                    firstName: parsedUser.first_name,
                    username: parsedUser.username,
                    photoUrl: parsedUser.photo_url,
                    isVerified: true,
                });
            } else {
                user.isVerified = true;
            }
            await user.save();
            return res.status(200).json({ success: true, message: "Verification successful!" });
        } else {
            return res.status(200).json({ success: false, message: "Please join all channels." });
        }
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ message: "Server error during verification." });
    }
};
