#!/bin/bash

# Backup script for database and critical files

echo "Starting backup process..."

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo ".env file not found!"
    exit 1
fi

# Create backup timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups/$TIMESTAMP"

# Create backup directory
mkdir -p $BACKUP_DIR

# Run database backup
echo "Backing up database..."
node scripts/maintenance/backup.js

# Backup configuration files
echo "Backing up configuration files..."
cp config/*.json $BACKUP_DIR/
cp .env $BACKUP_DIR/

# Backup uploaded files
if [ -d "uploads" ]; then
    echo "Backing up uploaded files..."
    cp -r uploads $BACKUP_DIR/
fi

# Compress backup
echo "Compressing backup..."
tar -czf "$BACKUP_DIR.tar.gz" $BACKUP_DIR
rm -rf $BACKUP_DIR

# Clean up old backups
echo "Cleaning up old backups..."
node scripts/maintenance/cleanup.js

echo "Backup completed successfully!"