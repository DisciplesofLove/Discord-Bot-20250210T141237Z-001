const rateLimit = require('express-rate-limit');

const commandRateLimit = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000 || 15 * 60 * 1000, // default 15 minutes
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
    message: 'Too many commands from this user, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    commandRateLimit
};