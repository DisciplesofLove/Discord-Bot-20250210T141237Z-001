const winston = require('winston');
const { format } = winston;

// Define log format
const logFormat = format.combine(
    format.timestamp(),
    format.json(),
    format.errors({ stack: true })
);

// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        // Write all logs error (and below) to error.log
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write all logs to combined.log
        new winston.transports.File({ 
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ]
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
}

module.exports = logger;