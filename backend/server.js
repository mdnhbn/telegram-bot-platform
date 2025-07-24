// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Body parser for JSON

// --- Database Connection ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1); // Exit process with failure
    }
};
connectDB();

// --- Routes ---
// আমরা এখানে আমাদের API রুটগুলো যোগ করব (পরবর্তী ধাপে)
app.get('/', (req, res) => {
    res.send('Backend Server is Running!');
});

// Import and use routes
// const apiRoutes = require('./routes/api');
// app.use('/api', apiRoutes);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
