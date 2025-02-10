const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function cleanupBackups() {
    console.log('Starting backup cleanup process...');

    try {
        const backupsDir = path.join(__dirname, '../../backups');
        const maxBackupAge = process.env.MAX_BACKUP_AGE_DAYS || 30; // Default 30 days
        const maxBackupCount = process.env.MAX_BACKUP_COUNT || 10; // Default 10 backups

        // Get all backup directories
        const backups = fs.readdirSync(backupsDir)
            .filter(item => {
                const itemPath = path.join(backupsDir, item);
                return fs.statSync(itemPath).isDirectory();
            })
            .map(dir => ({
                name: dir,
                path: path.join(backupsDir, dir),
                time: fs.statSync(path.join(backupsDir, dir)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time); // Sort by time, newest first

        // Remove old backups based on age
        const now = Date.now();
        const maxAge = maxBackupAge * 24 * 60 * 60 * 1000; // Convert days to milliseconds

        console.log(`Cleaning up backups older than ${maxBackupAge} days...`);
        backups.forEach(backup => {
            if (now - backup.time > maxAge) {
                console.log(`Removing old backup: ${backup.name}`);
                fs.rmSync(backup.path, { recursive: true, force: true });
            }
        });

        // Keep only the specified number of most recent backups
        const remainingBackups = fs.readdirSync(backupsDir)
            .filter(item => {
                const itemPath = path.join(backupsDir, item);
                return fs.statSync(itemPath).isDirectory();
            })
            .map(dir => ({
                name: dir,
                path: path.join(backupsDir, dir),
                time: fs.statSync(path.join(backupsDir, dir)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);

        if (remainingBackups.length > maxBackupCount) {
            console.log(`Keeping only the ${maxBackupCount} most recent backups...`);
            remainingBackups.slice(maxBackupCount).forEach(backup => {
                console.log(`Removing excess backup: ${backup.name}`);
                fs.rmSync(backup.path, { recursive: true, force: true });
            });
        }

        console.log('Cleanup completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

// Execute cleanup
cleanupBackups();