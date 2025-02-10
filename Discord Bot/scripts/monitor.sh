#!/bin/bash

# Monitoring script for application health checks

echo "Starting monitoring process..."

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo ".env file not found!"
    exit 1
fi

# Check system resources
echo "Checking system resources..."
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}')
MEMORY_USAGE=$(free -m | awk '/Mem:/ {print $3}')
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}')

echo "CPU Usage: $CPU_USAGE%"
echo "Memory Usage: $MEMORY_USAGE MB"
echo "Disk Usage: $DISK_USAGE"

# Check application status
echo "Checking application status..."
curl -s http://localhost:${PORT:-3000}/health

# Check database connection
echo "Checking database connection..."
node -e "
const db = require('./utils/database');
db.connect().then(() => {
    console.log('Database connection successful');
    process.exit(0);
}).catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
});"

# Log monitoring results
echo "Logging monitoring results..."
node monitoring/monitoring.js

echo "Monitoring check completed!"