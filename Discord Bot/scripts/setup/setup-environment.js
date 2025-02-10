const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables
require('dotenv').config();

async function setupEnvironment() {
    console.log('Setting up environment...');

    try {
        // Create necessary directories
        const directories = ['logs', 'data', 'uploads', 'backups'];
        directories.forEach(dir => {
            const dirPath = path.join(__dirname, '../../', dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                console.log(`Created directory: ${dir}`);
            }
        });

        // Set up configuration files
        console.log('Setting up configuration files...');
        const env = process.env.NODE_ENV || 'development';
        const configSource = path.join(__dirname, '../../config', `${env}.json`);
        const configDest = path.join(__dirname, '../../config/current.json');

        if (fs.existsSync(configSource)) {
            fs.copyFileSync(configSource, configDest);
            console.log(`Configured for ${env} environment`);
        }

        // Set up SSL certificates if needed
        if (process.env.USE_SSL === 'true') {
            console.log('Setting up SSL certificates...');
            // Add SSL setup logic here
        }

        // Set up environment-specific dependencies
        console.log('Installing environment-specific dependencies...');
        if (env === 'development') {
            execSync('npm install --only=dev', { stdio: 'inherit' });
        }

        // Initialize security keys
        console.log('Initializing security keys...');
        const keysDir = path.join(__dirname, '../../security/keys');
        if (!fs.existsSync(keysDir)) {
            fs.mkdirSync(keysDir, { recursive: true });
            // Generate keys if needed
            // execSync('openssl genrsa -out private.key 2048');
            // execSync('openssl rsa -in private.key -pubout -out public.key');
        }

        console.log('Environment setup completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Environment setup failed:', error);
        process.exit(1);
    }
}

// Execute environment setup
setupEnvironment();