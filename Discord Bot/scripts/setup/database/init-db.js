// scripts/database/init-db.js
const mongoose = require('mongoose');
const { EnvironmentManager } = require('../../utils/envManager');

async function initializeDatabase() {
    const envManager = new EnvironmentManager();
    await envManager.loadEncryptedEnvironment();

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Database connection successful");

        // Create indexes
        await Promise.all([
            require('../../src/models/core/Dataset').createIndexes(),
            require('../../src/models/core/Training').createIndexes(),
            require('../../src/models/dao/Proposal').createIndexes()
        ]);
        console.log("✅ Database indexes created");

    } catch (error) {
        console.error("❌ Database initialization failed:", error);
        process.exit(1);
    }
}

initializeDatabase()
    .then(() => process.exit(0))
    .catch(console.error);
