// scripts/init.js
const { execSync } = require('child_process');

async function initializeProject() {
    try {
        console.log("🚀 Initializing project...");

        // Encrypt environment variables
        console.log("\n📦 Encrypting environment variables...");
        execSync('npm run encrypt-env');

        // Setup infrastructure
        console.log("\n🏗️  Setting up infrastructure...");
        execSync('npm run setup:infra');

        // Initialize database
        console.log("\n🗄️  Initializing database...");
        execSync('npm run setup:db');

        // Deploy smart contracts
        console.log("\n📝 Deploying smart contracts...");
        execSync('npm run deploy:core');
        execSync('npm run deploy:dao');

        // Register Discord commands
        console.log("\n🤖 Registering Discord commands...");
        execSync('npm run discord:register');

        console.log("\n✅ Project initialization complete!");
    } catch (error) {
        console.error("\n❌ Initialization failed:", error);
        process.exit(1);
    }
}

initializeProject()
    .then(() => process.exit(0))
    .catch(console.error);
