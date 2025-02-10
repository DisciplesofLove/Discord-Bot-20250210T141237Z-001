const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function initDatabase() {
    console.log('Initializing database...');

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB successfully');

        // Load and apply database schemas
        const modelsPath = path.join(__dirname, '../../backend/models');
        const modelFiles = fs.readdirSync(modelsPath)
            .filter(file => file.endsWith('.model.js'));

        for (const file of modelFiles) {
            require(path.join(modelsPath, file));
            console.log(`Loaded model: ${file}`);
        }

        // Create indexes
        console.log('Creating database indexes...');
        for (const modelName of Object.keys(mongoose.models)) {
            await mongoose.models[modelName].createIndexes();
        }

        // Initialize default data if needed
        console.log('Checking for default data...');
        const User = mongoose.model('User');
        const adminExists = await User.findOne({ role: 'admin' });

        if (!adminExists) {
            console.log('Creating default admin user...');
            await User.create({
                username: 'admin',
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                role: 'admin'
            });
        }

        console.log('Database initialization completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

// Execute database initialization
initDatabase();