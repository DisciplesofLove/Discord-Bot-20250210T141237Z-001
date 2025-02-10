// backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { connectDB } = require('./config/database');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Routes
app.use('/api/v1/datasets', require('./routes/api.routes'));
app.use('/api/v1/training', require('./routes/training.routes'));
app.use('/api/v1/marketplace', require('./routes/marketplace.routes'));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
    try {
        await connectDB();
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
};

module.exports = { app, startServer };

// backend/src/server.js
require('dotenv').config();
const { startServer } = require('./app');
startServer();
