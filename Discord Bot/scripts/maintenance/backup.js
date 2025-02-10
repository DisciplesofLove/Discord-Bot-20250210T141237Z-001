const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

async function performBackup() {
    console.log('Starting database backup process...');

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(__dirname, '../../backups', timestamp);

        // Create backup directory if it doesn't exist
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        // Perform MongoDB backup using mongodump
        const dbName = process.env.DB_NAME || 'myapp';
        const backupPath = path.join(backupDir, 'mongodb');
        
        console.log('Running MongoDB backup...');
        execSync(`mongodump --uri "${process.env.MONGODB_URI}" --out "${backupPath}"`, {
            stdio: 'inherit'
        });

        // Backup application files
        console.log('Backing up application files...');
        
        // List of directories to backup
        const dirsToBackup = ['config', 'uploads'];
        
        for (const dir of dirsToBackup) {
            const sourcePath = path.join(__dirname, '../../', dir);
            const destPath = path.join(backupDir, dir);
            
            if (fs.existsSync(sourcePath)) {
                fs.mkdirSync(destPath, { recursive: true });
                execSync(`cp -r ${sourcePath}/* ${destPath}`, { stdio: 'inherit' });
            }
        }

        // Create backup metadata
        const metadata = {
            timestamp: new Date().toISOString(),
            version: process.env.APP_VERSION || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            backupType: 'full'
        };

        fs.writeFileSync(
            path.join(backupDir, 'backup-metadata.json'),
            JSON.stringify(metadata, null, 2)
        );

        console.log('Backup completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Backup failed:', error);
        process.exit(1);
    }
}

// Execute backup
performBackup();