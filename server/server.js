const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

// Import routers
const listRoutes = require('./routes/listRoutes');
const wordRoutes = require('./routes/wordRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
    cors({
        origin: ['https://cards-gamee.netlify.app', 'http://localhost:5173'],
    })
);
app.use(express.json());

// Custom logging middleware
app.use((req, res, next) => {
    const oldSend = res.send;
    res.send = function (data) {
        const now = new Date();
        const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
        res.send = oldSend;
        return res.send(data);
    };
    next();
});

// Mount API routers
app.get('/api/health', (req, res) => res.send({ project: 'Cards Game' }));
app.use('/api/lists', listRoutes);
app.use('/api', wordRoutes);

// Connect to Database and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB successfully!');
        app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error('Failed to start the server:', err);
    });
